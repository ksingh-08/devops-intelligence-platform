'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  RocketLaunchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Deployment {
  id: string
  fixId: string
  environment: 'staging' | 'production'
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rolled_back'
  timestamp: Date
  duration?: number
  url?: string
  commitHash: string
  deployedBy: 'autonomous_agent' | 'human'
  metrics?: {
    buildTime: number
    testsPassed: number
    totalTests: number
    performanceScore: number
  }
  rollbackReason?: string
}

const mockDeployments: Deployment[] = [
  {
    id: 'deploy-001',
    fixId: 'fix-001',
    environment: 'production',
    status: 'success',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    duration: 127,
    url: 'https://devops-intelligence.vercel.app',
    commitHash: 'a1b2c3d',
    deployedBy: 'autonomous_agent',
    metrics: {
      buildTime: 89,
      testsPassed: 12,
      totalTests: 12,
      performanceScore: 94
    }
  },
  {
    id: 'deploy-002',
    fixId: 'fix-002',
    environment: 'staging',
    status: 'success',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    duration: 95,
    url: 'https://devops-intelligence-staging.vercel.app',
    commitHash: 'b2c3d4e',
    deployedBy: 'autonomous_agent',
    metrics: {
      buildTime: 67,
      testsPassed: 8,
      totalTests: 8,
      performanceScore: 91
    }
  },
  {
    id: 'deploy-003',
    fixId: 'fix-003',
    environment: 'production',
    status: 'deploying',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    commitHash: 'c3d4e5f',
    deployedBy: 'autonomous_agent'
  },
  {
    id: 'deploy-004',
    fixId: 'fix-004',
    environment: 'production',
    status: 'failed',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    duration: 156,
    commitHash: 'd4e5f6g',
    deployedBy: 'autonomous_agent',
    metrics: {
      buildTime: 134,
      testsPassed: 5,
      totalTests: 8,
      performanceScore: 67
    },
    rollbackReason: 'Performance regression detected - response time increased by 40%'
  },
  {
    id: 'deploy-005',
    fixId: 'fix-005',
    environment: 'production',
    status: 'rolled_back',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: 203,
    commitHash: 'e5f6g7h',
    deployedBy: 'autonomous_agent',
    rollbackReason: 'Critical error rate spike detected within 5 minutes of deployment'
  }
]

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  deploying: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200',
  success: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200',
  failed: 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200',
  rolled_back: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200'
}

const statusIcons = {
  pending: ClockIcon,
  deploying: ArrowPathIcon,
  success: CheckCircleIcon,
  failed: XCircleIcon,
  rolled_back: ExclamationTriangleIcon
}

const environmentColors = {
  staging: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-200',
  production: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
}

export default function DeploymentTimeline() {
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)

  const successRate = mockDeployments.filter(d => d.status === 'success').length / 
                     mockDeployments.filter(d => d.status !== 'pending' && d.status !== 'deploying').length * 100

  const avgDeployTime = mockDeployments.filter(d => d.duration).reduce((acc, d) => acc + (d.duration || 0), 0) / 
                       mockDeployments.filter(d => d.duration).length

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <RocketLaunchIcon className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                {mockDeployments.length}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">
                Total Deployments
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

        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-primary-600" />
            <div>
              <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                {avgDeployTime.toFixed(0)}s
              </div>
              <div className="text-xs text-primary-700 dark:text-primary-300">
                Avg Deploy Time
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <RocketLaunchIcon className="w-5 h-5 text-secondary-600" />
            <div>
              <div className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                {mockDeployments.filter(d => d.deployedBy === 'autonomous_agent').length}
              </div>
              <div className="text-xs text-secondary-700 dark:text-secondary-300">
                Autonomous
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Timeline */}
      <div className="space-y-3">
        {mockDeployments.map((deployment, index) => {
          const StatusIcon = statusIcons[deployment.status]
          
          return (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedDeployment?.id === deployment.id 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedDeployment(selectedDeployment?.id === deployment.id ? null : deployment)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <StatusIcon className={`w-5 h-5 ${
                      deployment.status === 'success' ? 'text-success-500' :
                      deployment.status === 'failed' || deployment.status === 'rolled_back' ? 'text-error-500' :
                      deployment.status === 'deploying' ? 'text-primary-500 animate-spin' :
                      'text-gray-500'
                    }`} />
                    <span className={`badge ${statusColors[deployment.status]}`}>
                      {deployment.status.replace('_', ' ')}
                    </span>
                    <span className={`badge ${environmentColors[deployment.environment]}`}>
                      {deployment.environment}
                    </span>
                    <div className="flex items-center space-x-1">
                      <RocketLaunchIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Vercel
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Fix: {deployment.fixId}</span>
                    <span>Commit: {deployment.commitHash}</span>
                    {deployment.duration && (
                      <span>{deployment.duration}s</span>
                    )}
                    <span>{deployment.timestamp.toLocaleTimeString()}</span>
                  </div>

                  {deployment.url && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">URL:</span>
                      <a 
                        href={deployment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {deployment.url}
                      </a>
                    </div>
                  )}

                  {deployment.rollbackReason && (
                    <div className="mt-2 p-2 bg-error-50 dark:bg-error-900/20 rounded text-sm text-error-700 dark:text-error-300">
                      <strong>Rollback Reason:</strong> {deployment.rollbackReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedDeployment?.id === deployment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-4">
                    {/* Deployment Metrics */}
                    {deployment.metrics && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Deployment Metrics
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {deployment.metrics.buildTime}s
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Build Time
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {deployment.metrics.testsPassed}/{deployment.metrics.totalTests}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Tests Passed
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {deployment.metrics.performanceScore}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Performance Score
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {deployment.duration}s
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Total Time
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Deployment Details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Deployment Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Deployed By:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {deployment.deployedBy.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                            {deployment.environment}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Commit Hash:</span>
                          <span className="ml-2 font-mono text-gray-900 dark:text-white">
                            {deployment.commitHash}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                            {deployment.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-2">
                        {deployment.url && (
                          <a
                            href={deployment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            View Live
                          </a>
                        )}
                        <button className="btn btn-outline btn-sm">
                          View Logs
                        </button>
                        {deployment.status === 'success' && (
                          <button className="btn btn-warning btn-sm">
                            Rollback
                          </button>
                        )}
                        {deployment.status === 'failed' && (
                          <button className="btn btn-secondary btn-sm">
                            Retry Deploy
                          </button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Deploy ID: {deployment.id}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Vercel Integration Status */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Vercel Integration Active
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Auto-deploy enabled
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Next deployment ready
          </div>
        </div>
      </div>
    </div>
  )
}
