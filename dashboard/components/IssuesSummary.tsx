'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

interface Issue {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  confidence: number
  aiSummary: string
  affectedServices: string[]
  timestamp: Date
  status: 'detected' | 'analyzing' | 'resolved' | 'escalated'
}

const mockIssues: Issue[] = [
  {
    id: 'issue-001',
    title: 'High Error Rate in Payment Service',
    description: 'Payment processing showing 15% error rate, primarily timeout errors',
    severity: 'high',
    source: 'Datadog + Sentry',
    confidence: 0.91,
    aiSummary: 'Analysis indicates database connection pool exhaustion during peak traffic. Recommended action: Scale database connections and implement circuit breaker pattern.',
    affectedServices: ['payment-service', 'order-processing'],
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'analyzing'
  },
  {
    id: 'issue-002', 
    title: 'Memory Leak in User Authentication',
    description: 'Gradual memory increase in auth service over 6 hours',
    severity: 'medium',
    source: 'New Relic + CloudWatch',
    confidence: 0.84,
    aiSummary: 'Memory usage pattern suggests connection leak in Redis client. Recommended action: Update Redis client library and implement proper connection cleanup.',
    affectedServices: ['auth-service'],
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'resolved'
  },
  {
    id: 'issue-003',
    title: 'API Rate Limit Exceeded',
    description: 'Third-party API calls hitting rate limits causing 429 errors',
    severity: 'low',
    source: 'GitHub + Sentry',
    confidence: 0.76,
    aiSummary: 'External API rate limiting detected. Recommended action: Implement exponential backoff and request queuing mechanism.',
    affectedServices: ['notification-service'],
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    status: 'detected'
  }
]

const severityColors = {
  low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  medium: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  high: 'bg-red-500/10 text-red-400 border border-red-500/20',
  critical: 'bg-red-500/20 text-red-300 border border-red-500/30'
}

const statusColors = {
  detected: 'bg-gray-800 text-gray-300 border border-gray-700',
  analyzing: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  resolved: 'bg-green-500/10 text-green-400 border border-green-500/20',
  escalated: 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
}

const statusIcons = {
  detected: ExclamationTriangleIcon,
  analyzing: ClockIcon,
  resolved: CheckCircleIcon,
  escalated: ExclamationTriangleIcon
}

export default function IssuesSummary() {
  const [issues, setIssues] = useState(mockIssues)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setIssues(prevIssues => {
        const newIssues = [...prevIssues]
        const analyzingIssue = newIssues.find(issue => issue.status === 'analyzing')
        
        if (analyzingIssue && Math.random() > 0.7) {
          analyzingIssue.status = 'resolved'
          analyzingIssue.confidence = Math.min(analyzingIssue.confidence + 0.05, 0.99)
        }
        
        return newIssues
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.8) return 'text-blue-400'
    if (confidence >= 0.7) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-lg font-semibold text-white">
                {issues.length}
              </div>
              <div className="text-xs text-gray-400">
                Total Issues
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-lg font-semibold text-white">
                {issues.filter(i => i.status === 'resolved').length}
              </div>
              <div className="text-xs text-gray-400">
                Resolved
              </div>
            </div>
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-lg font-semibold text-white">
                {issues.filter(i => i.status === 'analyzing').length}
              </div>
              <div className="text-xs text-gray-400">
                Analyzing
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-lg font-semibold text-white">
                {(issues.reduce((acc, i) => acc + i.confidence, 0) / issues.length * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">
                Avg Confidence
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {issues.map((issue, index) => {
          const StatusIcon = statusIcons[issue.status]
          
          return (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedIssue?.id === issue.id 
                  ? 'border-blue-500/50 bg-blue-500/5' 
                  : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
              }`}
              onClick={() => setSelectedIssue(selectedIssue?.id === issue.id ? null : issue)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <StatusIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-sm font-medium text-white truncate">
                      {issue.title}
                    </h3>
                    <span className={`badge ${severityColors[issue.severity]}`}>
                      {issue.severity}
                    </span>
                    <span className={`badge ${statusColors[issue.status]}`}>
                      {issue.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">
                    {issue.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Source: {issue.source}</span>
                    <span className={getConfidenceColor(issue.confidence)}>
                      Confidence: {(issue.confidence * 100).toFixed(1)}%
                    </span>
                    <span>{issue.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedIssue?.id === issue.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-800"
                >
                  <div className="space-y-3">
                    {/* AI Summary */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">
                        🤖 Kestra AI Agent Analysis
                      </h4>
                      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                        <p className="text-sm text-gray-300">
                          {issue.aiSummary}
                        </p>
                      </div>
                    </div>

                    {/* Affected Services */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">
                        Affected Services
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {issue.affectedServices.map(service => (
                          <span 
                            key={service}
                            className="badge badge-gray"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-2">
                        {issue.status === 'detected' && (
                          <button className="btn btn-primary btn-sm">
                            Start Analysis
                          </button>
                        )}
                        {issue.status === 'analyzing' && (
                          <button className="btn btn-secondary btn-sm">
                            Generate Fix
                          </button>
                        )}
                        <button className="btn btn-outline btn-sm">
                          View Details
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        ID: {issue.id}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Real-time Indicator */}
      <div className="flex items-center justify-center pt-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse glow-green" />
          <span>Real-time monitoring active</span>
          <span>•</span>
          <span>Next scan in 2m 15s</span>
        </div>
      </div>
    </div>
  )
}
