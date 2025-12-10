'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Decision {
  id: string
  issueId: string
  timestamp: Date
  decision: 'auto_resolve' | 'escalate_human' | 'schedule_maintenance' | 'monitor_only'
  confidence: number
  reasoning: string
  factors: {
    severity: string
    businessImpact: string
    technicalComplexity: string
    historicalSuccess: number
  }
  outcome?: 'success' | 'failure' | 'pending'
  executionTime?: number
  aiModel: string
}

const mockDecisions: Decision[] = [
  {
    id: 'decision-001',
    issueId: 'issue-001',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    decision: 'auto_resolve',
    confidence: 0.91,
    reasoning: 'High confidence based on similar past issues. Database connection pool issues have 94% success rate with automated fixes.',
    factors: {
      severity: 'high',
      businessImpact: 'medium',
      technicalComplexity: 'low',
      historicalSuccess: 0.94
    },
    outcome: 'success',
    executionTime: 127,
    aiModel: 'gpt-4-turbo-preview'
  },
  {
    id: 'decision-002',
    issueId: 'issue-002',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    decision: 'auto_resolve',
    confidence: 0.84,
    reasoning: 'Memory leak pattern recognized. Redis connection management fixes have high success rate in similar scenarios.',
    factors: {
      severity: 'medium',
      businessImpact: 'low',
      technicalComplexity: 'medium',
      historicalSuccess: 0.87
    },
    outcome: 'success',
    executionTime: 89,
    aiModel: 'gpt-4-turbo-preview'
  },
  {
    id: 'decision-003',
    issueId: 'issue-003',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    decision: 'schedule_maintenance',
    confidence: 0.76,
    reasoning: 'Confidence below threshold for immediate deployment. Rate limiting changes require careful testing.',
    factors: {
      severity: 'low',
      businessImpact: 'medium',
      technicalComplexity: 'high',
      historicalSuccess: 0.72
    },
    outcome: 'pending',
    aiModel: 'gpt-4-turbo-preview'
  },
  {
    id: 'decision-004',
    issueId: 'issue-004',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    decision: 'escalate_human',
    confidence: 0.45,
    reasoning: 'Critical security vulnerability detected. Human review required for security-related fixes.',
    factors: {
      severity: 'critical',
      businessImpact: 'high',
      technicalComplexity: 'high',
      historicalSuccess: 0.45
    },
    outcome: 'pending',
    aiModel: 'gpt-4-turbo-preview'
  }
]

const decisionColors = {
  auto_resolve: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200',
  escalate_human: 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200',
  schedule_maintenance: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200',
  monitor_only: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}

const outcomeColors = {
  success: 'text-success-600 dark:text-success-400',
  failure: 'text-error-600 dark:text-error-400',
  pending: 'text-warning-600 dark:text-warning-400'
}

const outcomeIcons = {
  success: CheckCircleIcon,
  failure: XCircleIcon,
  pending: ClockIcon
}

export default function DecisionHistory() {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-success-600 dark:text-success-400'
    if (confidence >= 0.8) return 'text-primary-600 dark:text-primary-400'
    if (confidence >= 0.7) return 'text-warning-600 dark:text-warning-400'
    return 'text-error-600 dark:text-error-400'
  }

  const successRate = mockDecisions.filter(d => d.outcome === 'success').length / 
                     mockDecisions.filter(d => d.outcome !== 'pending').length * 100

  const avgConfidence = mockDecisions.reduce((acc, d) => acc + d.confidence, 0) / 
                       mockDecisions.length * 100

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5 text-primary-600" />
            <div>
              <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                {mockDecisions.length}
              </div>
              <div className="text-xs text-primary-700 dark:text-primary-300">
                Total Decisions
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-success-600" />
            <div>
              <div className="text-lg font-semibold text-success-900 dark:text-success-100">
                {successRate.toFixed(0)}%
              </div>
              <div className="text-xs text-success-700 dark:text-success-300">
                Success Rate
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5 text-secondary-600" />
            <div>
              <div className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                {avgConfidence.toFixed(0)}%
              </div>
              <div className="text-xs text-secondary-700 dark:text-secondary-300">
                Avg Confidence
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                {mockDecisions.filter(d => d.decision === 'auto_resolve').length}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">
                Auto-Resolved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decisions List */}
      <div className="space-y-3">
        {mockDecisions.map((decision, index) => {
          const OutcomeIcon = decision.outcome ? outcomeIcons[decision.outcome] : ClockIcon
          
          return (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedDecision?.id === decision.id 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedDecision(selectedDecision?.id === decision.id ? null : decision)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <CpuChipIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className={`badge ${decisionColors[decision.decision]}`}>
                      {decision.decision.replace('_', ' ')}
                    </span>
                    <span className={getConfidenceColor(decision.confidence)}>
                      {(decision.confidence * 100).toFixed(1)}% confidence
                    </span>
                    {decision.outcome && (
                      <div className="flex items-center space-x-1">
                        <OutcomeIcon className={`w-4 h-4 ${outcomeColors[decision.outcome]}`} />
                        <span className={`text-xs ${outcomeColors[decision.outcome]}`}>
                          {decision.outcome}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {decision.reasoning}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Issue: {decision.issueId}</span>
                    <span>Model: {decision.aiModel}</span>
                    {decision.executionTime && (
                      <span>Executed in {decision.executionTime}s</span>
                    )}
                    <span>{decision.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedDecision?.id === decision.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-4">
                    {/* Decision Factors */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Decision Factors Analysis
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Severity</span>
                            <span className={`badge ${
                              decision.factors.severity === 'critical' ? 'badge-error' :
                              decision.factors.severity === 'high' ? 'badge-warning' :
                              decision.factors.severity === 'medium' ? 'badge-secondary' :
                              'badge-gray'
                            }`}>
                              {decision.factors.severity}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Business Impact</span>
                            <span className={`badge ${
                              decision.factors.businessImpact === 'high' ? 'badge-error' :
                              decision.factors.businessImpact === 'medium' ? 'badge-warning' :
                              'badge-success'
                            }`}>
                              {decision.factors.businessImpact}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Technical Complexity</span>
                            <span className={`badge ${
                              decision.factors.technicalComplexity === 'high' ? 'badge-error' :
                              decision.factors.technicalComplexity === 'medium' ? 'badge-warning' :
                              'badge-success'
                            }`}>
                              {decision.factors.technicalComplexity}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Historical Success</span>
                            <span className={`text-sm font-medium ${getConfidenceColor(decision.factors.historicalSuccess)}`}>
                              {(decision.factors.historicalSuccess * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Breakdown */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Confidence Score Breakdown
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-24">AI Analysis</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${decision.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                            {(decision.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-24">Historical</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-secondary-600 h-2 rounded-full" 
                              style={{ width: `${decision.factors.historicalSuccess * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                            {(decision.factors.historicalSuccess * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-2">
                        <button className="btn btn-outline btn-sm">
                          View Issue
                        </button>
                        {decision.outcome === 'success' && (
                          <button className="btn btn-success btn-sm">
                            View Results
                          </button>
                        )}
                        {decision.outcome === 'failure' && (
                          <button className="btn btn-error btn-sm">
                            View Error
                          </button>
                        )}
                        <button className="btn btn-outline btn-sm">
                          Replay Decision
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Decision ID: {decision.id}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* AI Decision Engine Status */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Decision Engine Active
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Threshold: 80% confidence
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Learning from outcomes
          </div>
        </div>
      </div>
    </div>
  )
}
