'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  CpuChipIcon,
  CodeBracketIcon,
  EyeIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

interface PipelineStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: number
  tool: 'kestra' | 'cline' | 'coderabbit' | 'vercel'
  confidence?: number
}

const mockPipelineSteps: PipelineStep[] = [
  {
    id: 'data-collection',
    name: 'Data Collection',
    description: 'Gathering data from Datadog, New Relic, GitHub, Sentry, CloudWatch',
    status: 'completed',
    duration: 45,
    tool: 'kestra'
  },
  {
    id: 'ai-analysis',
    name: 'AI Analysis',
    description: 'Kestra AI Agent analyzing issues and generating summaries',
    status: 'completed',
    duration: 32,
    tool: 'kestra',
    confidence: 0.87
  },
  {
    id: 'decision-making',
    name: 'Decision Engine',
    description: 'Autonomous decision on auto-resolve vs escalate',
    status: 'completed',
    duration: 12,
    tool: 'kestra',
    confidence: 0.91
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Cline CLI generating fix code based on AI analysis',
    status: 'running',
    tool: 'cline'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'CodeRabbit automated review and quality checks',
    status: 'pending',
    tool: 'coderabbit'
  },
  {
    id: 'deployment',
    name: 'Deployment',
    description: 'Vercel automated deployment to production',
    status: 'pending',
    tool: 'vercel'
  }
]

const toolColors = {
  kestra: 'bg-primary-500',
  cline: 'bg-secondary-500', 
  coderabbit: 'bg-warning-500',
  vercel: 'bg-success-500'
}

const toolIcons = {
  kestra: CpuChipIcon,
  cline: CodeBracketIcon,
  coderabbit: EyeIcon,
  vercel: RocketLaunchIcon
}

export default function PipelineView() {
  const [steps, setSteps] = useState(mockPipelineSteps)
  const [currentStep, setCurrentStep] = useState(3) // 0-indexed

  useEffect(() => {
    // Simulate pipeline progression
    const interval = setInterval(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps]
        const runningStepIndex = newSteps.findIndex(step => step.status === 'running')
        
        if (runningStepIndex !== -1) {
          // Complete current running step
          newSteps[runningStepIndex].status = 'completed'
          newSteps[runningStepIndex].duration = Math.floor(Math.random() * 60) + 20
          
          // Start next step if available
          if (runningStepIndex + 1 < newSteps.length) {
            newSteps[runningStepIndex + 1].status = 'running'
            setCurrentStep(runningStepIndex + 1)
          }
        }
        
        return newSteps
      })
    }, 8000) // Progress every 8 seconds for demo

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-success-500" />
      case 'running':
        return <ClockIcon className="w-5 h-5 text-primary-500 animate-spin" />
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-error-500" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-success-500 bg-success-50 dark:bg-success-900/20'
      case 'running':
        return 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 animate-pulse'
      case 'failed':
        return 'border-error-500 bg-error-50 dark:bg-error-900/20'
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Pipeline Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const ToolIcon = toolIcons[step.tool]
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-center p-4 rounded-lg border-2 transition-all duration-300 ${getStatusColor(step.status)}`}
            >
              {/* Step Number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-dark-800 border-2 border-gray-300 dark:border-dark-600 flex items-center justify-center mr-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {index + 1}
                </span>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {step.name}
                  </h3>
                  
                  {/* Tool Badge */}
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${toolColors[step.tool]}`} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {step.tool}
                    </span>
                  </div>

                  {/* Confidence Score */}
                  {step.confidence && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Confidence:
                      </span>
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {(step.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {step.description}
                </p>

                {/* Duration */}
                {step.duration && (
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {step.duration}s
                    </span>
                  </div>
                )}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0 ml-4">
                {getStatusIcon(step.status)}
              </div>

              {/* Tool Icon */}
              <div className="flex-shrink-0 ml-3">
                <div className={`w-8 h-8 rounded-lg ${toolColors[step.tool]} flex items-center justify-center`}>
                  <ToolIcon className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-full w-0.5 h-4 bg-gray-300 dark:bg-gray-600 transform translate-y-0" />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {steps.filter(s => s.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Completed
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {steps.filter(s => s.status === 'running').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Running
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {steps.filter(s => s.duration).reduce((acc, s) => acc + (s.duration || 0), 0)}s
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Time
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {steps.filter(s => s.confidence).length > 0 
              ? (steps.filter(s => s.confidence).reduce((acc, s) => acc + (s.confidence || 0), 0) / steps.filter(s => s.confidence).length * 100).toFixed(1)
              : 0}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg Confidence
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Pipeline Active
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Next execution in 4m 32s
          </div>
        </div>
      </div>
    </div>
  )
}
