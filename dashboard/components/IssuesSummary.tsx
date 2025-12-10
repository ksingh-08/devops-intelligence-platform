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
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  medium: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200',
  high: 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
}

const statusColors = {
  detected: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  analyzing: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200',
  resolved: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200',
  escalated: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200'
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
    if (confidence >= 0.9) return 'text-success-600 dark:text-success-400'
    if (confidence >= 0.8) return 'text-primary-600 dark:text-primary-400'
    if (confidence >= 0.7) return 'text-warning-600 dark:text-warning-400'
    return 'text-error-600 dark:text-error-400'
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5 text-primary-600" />
            <div>
              <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                {issues.length}
              </div>
              <div className="text-xs text-primary-700 dark:text-primary-300">
                Total Issues
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-success-600" />
            <div>
              <div className="text-lg font-semibold text-success-900 dark:text-success-100">
                {issues.filter(i => i.status === 'resolved').length}
              </div>
              <div className="text-xs text-success-700 dark:text-success-300">
                Resolved
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-warning-600" />
            <div>
              <div className="text-lg font-semibold text-warning-900 dark:text-warning-100">
                {issues.filter(i => i.status === 'analyzing').length}
              </div>
              <div className="text-xs text-warning-700 dark:text-warning-300">
                Analyzing
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5 text-secondary-600" />
            <div>
              <div className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                {(issues.reduce((acc, i) => acc + i.confidence, 0) / issues.length * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-secondary-700 dark:text-secondary-300">
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
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedIssue?.id === issue.id 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedIssue(selectedIssue?.id === issue.id ? null : issue)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <StatusIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {issue.title}
                    </h3>
                    <span className={`badge ${severityColors[issue.severity]}`}>
                      {issue.severity}
                    </span>
                    <span className={`badge ${statusColors[issue.status]}`}>
                      {issue.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {issue.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
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
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-3">
                    {/* AI Summary */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        🤖 Kestra AI Agent Analysis
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {issue.aiSummary}
                        </p>
                      </div>
                    </div>

                    {/* Affected Services */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
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
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
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
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
          <span>Real-time monitoring active</span>
          <span>•</span>
          <span>Next scan in 2m 15s</span>
        </div>
      </div>
    </div>
  )
}
