#!/usr/bin/env python3
"""
DevOps Intelligence Platform - Decision Engine

This module implements the core decision-making logic for the autonomous
DevOps agent. It processes AI analysis results and determines whether
issues should be auto-resolved or escalated to humans.

Built for AI Agents Assemble Hackathon - integrating Kestra AI Agent
with autonomous decision-making capabilities.
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Severity(Enum):
    """Issue severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ActionType(Enum):
    """Types of actions the agent can take"""
    CODE_FIX = "code_fix"
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    RESTART_SERVICE = "restart_service"
    ROLLBACK = "rollback"
    CONFIGURATION_CHANGE = "configuration_change"
    MANUAL_REVIEW = "manual_review"

class DecisionOutcome(Enum):
    """Possible decision outcomes"""
    AUTO_RESOLVE = "auto_resolve"
    SCHEDULE_MAINTENANCE = "schedule_maintenance"
    ESCALATE_HUMAN = "escalate_human"
    MONITOR_ONLY = "monitor_only"

@dataclass
class Issue:
    """Represents a production issue"""
    id: str
    description: str
    severity: Severity
    source: str
    timestamp: datetime
    error_count: int
    affected_services: List[str]
    metadata: Dict[str, Any]

@dataclass
class Recommendation:
    """AI-generated recommendation for an issue"""
    issue_id: str
    action_type: ActionType
    confidence_score: float
    estimated_impact: str
    suggested_fix: str
    risk_assessment: str
    time_estimate: int  # minutes
    prerequisites: List[str]

@dataclass
class Decision:
    """Final decision made by the engine"""
    id: str
    issue_id: str
    recommendation: Recommendation
    outcome: DecisionOutcome
    confidence: float
    reasoning: str
    timestamp: datetime
    auto_approved: bool
    estimated_completion: datetime

class DecisionEngine:
    """
    Core decision engine for autonomous DevOps actions.
    
    This engine processes AI recommendations and makes autonomous decisions
    about whether to auto-resolve issues or escalate to humans based on
    confidence scores, risk assessment, and business rules.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the decision engine with configuration.
        
        Args:
            config: Configuration dictionary containing thresholds and rules
        """
        self.config = config
        self.confidence_threshold = config.get('confidence_threshold', 0.8)
        self.max_auto_deployments_per_hour = config.get('max_auto_deployments_per_hour', 5)
        self.business_hours_only = config.get('business_hours_only', False)
        self.critical_services = config.get('critical_services', [])
        
        # Track recent decisions for rate limiting
        self.recent_decisions: List[Decision] = []
        
        logger.info(f"Decision engine initialized with confidence threshold: {self.confidence_threshold}")

    def process_ai_analysis(self, ai_response: str) -> List[Decision]:
        """
        Process AI analysis results and make autonomous decisions.
        
        Args:
            ai_response: JSON string containing AI analysis and recommendations
            
        Returns:
            List of decisions made by the engine
        """
        try:
            analysis = json.loads(ai_response)
            issues = self._parse_issues(analysis.get('issues', []))
            recommendations = self._parse_recommendations(analysis.get('recommendations', []))
            
            decisions = []
            for recommendation in recommendations:
                decision = self._make_decision(recommendation, issues)
                decisions.append(decision)
                
            # Apply rate limiting and business rules
            filtered_decisions = self._apply_business_rules(decisions)
            
            logger.info(f"Processed {len(recommendations)} recommendations, made {len(filtered_decisions)} decisions")
            return filtered_decisions
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI analysis: {e}")
            return []
        except Exception as e:
            logger.error(f"Error processing AI analysis: {e}")
            return []

    def _parse_issues(self, issues_data: List[Dict]) -> Dict[str, Issue]:
        """Parse issues from AI analysis data"""
        issues = {}
        for issue_data in issues_data:
            issue = Issue(
                id=issue_data.get('id', f"issue_{len(issues)}"),
                description=issue_data.get('description', 'Unknown issue'),
                severity=Severity(issue_data.get('severity', 'medium')),
                source=issue_data.get('source', 'unknown'),
                timestamp=datetime.fromisoformat(issue_data.get('timestamp', datetime.now().isoformat())),
                error_count=issue_data.get('error_count', 0),
                affected_services=issue_data.get('affected_services', []),
                metadata=issue_data.get('metadata', {})
            )
            issues[issue.id] = issue
        return issues

    def _parse_recommendations(self, recommendations_data: List[Dict]) -> List[Recommendation]:
        """Parse recommendations from AI analysis data"""
        recommendations = []
        for rec_data in recommendations_data:
            recommendation = Recommendation(
                issue_id=rec_data.get('issue_id', 'unknown'),
                action_type=ActionType(rec_data.get('action_type', 'manual_review')),
                confidence_score=rec_data.get('confidence_score', 0.0),
                estimated_impact=rec_data.get('estimated_impact', 'Unknown'),
                suggested_fix=rec_data.get('suggested_fix', ''),
                risk_assessment=rec_data.get('risk_assessment', 'Medium risk'),
                time_estimate=rec_data.get('time_estimate', 30),
                prerequisites=rec_data.get('prerequisites', [])
            )
            recommendations.append(recommendation)
        return recommendations

    def _make_decision(self, recommendation: Recommendation, issues: Dict[str, Issue]) -> Decision:
        """
        Make a decision for a single recommendation.
        
        Args:
            recommendation: The AI recommendation to evaluate
            issues: Dictionary of all issues
            
        Returns:
            Decision object with the final determination
        """
        issue = issues.get(recommendation.issue_id)
        if not issue:
            logger.warning(f"Issue {recommendation.issue_id} not found")
            return self._create_escalation_decision(recommendation, "Issue not found")

        # Evaluate confidence score
        confidence_check = recommendation.confidence_score >= self.confidence_threshold
        
        # Evaluate severity and risk
        severity_check = self._evaluate_severity_risk(issue, recommendation)
        
        # Evaluate business impact
        business_impact_check = self._evaluate_business_impact(issue, recommendation)
        
        # Evaluate technical feasibility
        technical_check = self._evaluate_technical_feasibility(recommendation)
        
        # Make final decision
        if all([confidence_check, severity_check, business_impact_check, technical_check]):
            outcome = DecisionOutcome.AUTO_RESOLVE
            auto_approved = True
            reasoning = f"All checks passed: confidence={recommendation.confidence_score:.2f}, severity={issue.severity.value}"
        elif recommendation.confidence_score >= 0.6 and issue.severity != Severity.CRITICAL:
            outcome = DecisionOutcome.SCHEDULE_MAINTENANCE
            auto_approved = False
            reasoning = f"Medium confidence, scheduling for maintenance window"
        else:
            outcome = DecisionOutcome.ESCALATE_HUMAN
            auto_approved = False
            reasoning = f"Failed checks: confidence={recommendation.confidence_score:.2f}, severity={issue.severity.value}"

        decision = Decision(
            id=f"decision_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{recommendation.issue_id}",
            issue_id=recommendation.issue_id,
            recommendation=recommendation,
            outcome=outcome,
            confidence=recommendation.confidence_score,
            reasoning=reasoning,
            timestamp=datetime.now(),
            auto_approved=auto_approved,
            estimated_completion=datetime.now() + timedelta(minutes=recommendation.time_estimate)
        )
        
        logger.info(f"Decision made for {recommendation.issue_id}: {outcome.value} (confidence: {recommendation.confidence_score:.2f})")
        return decision

    def _evaluate_severity_risk(self, issue: Issue, recommendation: Recommendation) -> bool:
        """
        Evaluate if the issue severity and recommendation risk are acceptable for auto-resolution.
        
        Args:
            issue: The issue being evaluated
            recommendation: The recommendation being evaluated
            
        Returns:
            True if severity/risk is acceptable for auto-resolution
        """
        # Critical issues require human review unless very high confidence
        if issue.severity == Severity.CRITICAL:
            return recommendation.confidence_score >= 0.95
        
        # High severity issues need higher confidence
        if issue.severity == Severity.HIGH:
            return recommendation.confidence_score >= 0.85
        
        # Medium and low severity can be auto-resolved with standard confidence
        return True

    def _evaluate_business_impact(self, issue: Issue, recommendation: Recommendation) -> bool:
        """
        Evaluate business impact of the issue and proposed fix.
        
        Args:
            issue: The issue being evaluated
            recommendation: The recommendation being evaluated
            
        Returns:
            True if business impact is acceptable for auto-resolution
        """
        # Check if critical services are affected
        critical_services_affected = any(
            service in self.critical_services 
            for service in issue.affected_services
        )
        
        if critical_services_affected:
            # Critical services need higher confidence and safer actions
            safe_actions = [ActionType.SCALE_UP, ActionType.CONFIGURATION_CHANGE]
            return (recommendation.action_type in safe_actions and 
                   recommendation.confidence_score >= 0.9)
        
        # Check business hours restriction
        if self.business_hours_only:
            current_hour = datetime.now().hour
            is_business_hours = 9 <= current_hour <= 17
            if not is_business_hours and issue.severity in [Severity.HIGH, Severity.CRITICAL]:
                return False
        
        return True

    def _evaluate_technical_feasibility(self, recommendation: Recommendation) -> bool:
        """
        Evaluate technical feasibility of the recommendation.
        
        Args:
            recommendation: The recommendation being evaluated
            
        Returns:
            True if technically feasible for auto-execution
        """
        # Check if prerequisites are met
        if recommendation.prerequisites:
            # In a real implementation, check if prerequisites are actually satisfied
            logger.info(f"Prerequisites required: {recommendation.prerequisites}")
        
        # Some actions are inherently safer for automation
        safe_actions = [
            ActionType.SCALE_UP,
            ActionType.CONFIGURATION_CHANGE,
            ActionType.RESTART_SERVICE
        ]
        
        risky_actions = [
            ActionType.ROLLBACK,
            ActionType.CODE_FIX
        ]
        
        if recommendation.action_type in risky_actions:
            return recommendation.confidence_score >= 0.9
        
        return recommendation.action_type in safe_actions

    def _apply_business_rules(self, decisions: List[Decision]) -> List[Decision]:
        """
        Apply business rules and rate limiting to decisions.
        
        Args:
            decisions: List of decisions to filter
            
        Returns:
            Filtered list of decisions that comply with business rules
        """
        # Clean up old decisions (older than 1 hour)
        cutoff_time = datetime.now() - timedelta(hours=1)
        self.recent_decisions = [
            d for d in self.recent_decisions 
            if d.timestamp > cutoff_time
        ]
        
        # Count recent auto-approvals
        recent_auto_approvals = sum(
            1 for d in self.recent_decisions 
            if d.auto_approved and d.outcome == DecisionOutcome.AUTO_RESOLVE
        )
        
        filtered_decisions = []
        auto_approvals_added = 0
        
        for decision in decisions:
            # Apply rate limiting for auto-approvals
            if (decision.auto_approved and 
                decision.outcome == DecisionOutcome.AUTO_RESOLVE):
                
                if (recent_auto_approvals + auto_approvals_added) >= self.max_auto_deployments_per_hour:
                    # Convert to scheduled maintenance instead
                    decision.outcome = DecisionOutcome.SCHEDULE_MAINTENANCE
                    decision.auto_approved = False
                    decision.reasoning += " (Rate limited - converted to scheduled maintenance)"
                    logger.warning(f"Rate limited decision {decision.id}")
                else:
                    auto_approvals_added += 1
            
            filtered_decisions.append(decision)
            self.recent_decisions.append(decision)
        
        logger.info(f"Applied business rules: {len(decisions)} -> {len(filtered_decisions)} decisions")
        return filtered_decisions

    def _create_escalation_decision(self, recommendation: Recommendation, reason: str) -> Decision:
        """Create an escalation decision with the given reason"""
        return Decision(
            id=f"escalation_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            issue_id=recommendation.issue_id,
            recommendation=recommendation,
            outcome=DecisionOutcome.ESCALATE_HUMAN,
            confidence=0.0,
            reasoning=reason,
            timestamp=datetime.now(),
            auto_approved=False,
            estimated_completion=datetime.now() + timedelta(hours=2)  # Assume 2 hours for human review
        )

    def get_decision_summary(self, decisions: List[Decision]) -> Dict[str, Any]:
        """
        Generate a summary of decisions made.
        
        Args:
            decisions: List of decisions to summarize
            
        Returns:
            Dictionary containing decision summary statistics
        """
        if not decisions:
            return {
                "total_decisions": 0,
                "auto_approved": 0,
                "escalations": 0,
                "scheduled": 0,
                "average_confidence": 0.0
            }
        
        auto_approved = sum(1 for d in decisions if d.auto_approved)
        escalations = sum(1 for d in decisions if d.outcome == DecisionOutcome.ESCALATE_HUMAN)
        scheduled = sum(1 for d in decisions if d.outcome == DecisionOutcome.SCHEDULE_MAINTENANCE)
        avg_confidence = sum(d.confidence for d in decisions) / len(decisions)
        
        return {
            "total_decisions": len(decisions),
            "auto_approved": auto_approved,
            "escalations": escalations,
            "scheduled": scheduled,
            "monitor_only": len(decisions) - auto_approved - escalations - scheduled,
            "average_confidence": round(avg_confidence, 3),
            "decisions": [
                {
                    "id": d.id,
                    "issue_id": d.issue_id,
                    "outcome": d.outcome.value,
                    "confidence": d.confidence,
                    "auto_approved": d.auto_approved,
                    "reasoning": d.reasoning,
                    "action_type": d.recommendation.action_type.value,
                    "estimated_completion": d.estimated_completion.isoformat()
                }
                for d in decisions
            ]
        }

def main():
    """
    Main function for testing the decision engine.
    This would be called by Kestra workflows in production.
    """
    # Example configuration
    config = {
        'confidence_threshold': 0.8,
        'max_auto_deployments_per_hour': 5,
        'business_hours_only': False,
        'critical_services': ['payment-service', 'user-auth', 'core-api']
    }
    
    # Example AI analysis response
    sample_ai_response = {
        "issues": [
            {
                "id": "issue_001",
                "description": "High error rate in payment service",
                "severity": "high",
                "source": "datadog",
                "timestamp": datetime.now().isoformat(),
                "error_count": 45,
                "affected_services": ["payment-service"],
                "metadata": {"error_type": "timeout", "region": "us-east-1"}
            }
        ],
        "recommendations": [
            {
                "issue_id": "issue_001",
                "action_type": "scale_up",
                "confidence_score": 0.85,
                "estimated_impact": "Reduce error rate by 80%",
                "suggested_fix": "Scale payment service from 3 to 6 instances",
                "risk_assessment": "Low risk - scaling up is safe",
                "time_estimate": 5,
                "prerequisites": ["sufficient_capacity", "auto_scaling_enabled"]
            }
        ]
    }
    
    # Initialize and run decision engine
    engine = DecisionEngine(config)
    decisions = engine.process_ai_analysis(json.dumps(sample_ai_response))
    summary = engine.get_decision_summary(decisions)
    
    print("Decision Engine Results:")
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
