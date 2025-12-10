'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import PipelineView from '../components/PipelineView'
import IssuesSummary from '../components/IssuesSummary'
import FixesGenerated from '../components/FixesGenerated'
import DecisionHistory from '../components/DecisionHistory'
import DeploymentTimeline from '../components/DeploymentTimeline'
import HackathonDemo from '../components/HackathonDemo'

// Mock data for demonstration
const mockStats = {
  totalIssues: 47,
  resolvedIssues: 42,
  avgResponseTime: '8.3 minutes',
  confidenceScore: 0.87,
  deploymentsToday: 12,
  successRate: 94.2
}

const mockRecentActivity = [
  {
    id: 1,
    type: 'issue_detected',
    message: 'High error rate detected in payment service',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    severity: 'high'
  },
  {
    id: 2,
    type: 'fix_generated',
    message: 'Cline CLI generated timeout fix for payment service',
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    severity: 'info'
  },
  {
    id: 3,
    type: 'deployment_success',
    message: 'Fix deployed successfully to production',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    severity: 'success'
  }
]

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    DevOps Intelligence Platform
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI Agents Assemble Hackathon
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500 animate-pulse' : 'bg-error-500'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Current Time */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentTime.toLocaleTimeString()}
              </div>

              {/* Hackathon Badge */}
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Live Demo
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Hackathon Demo Section */}
          <motion.div variants={itemVariants}>
            <HackathonDemo />
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <div className="card hover-lift">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Issues
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockStats.totalIssues}
                      </p>
                    </div>
                    <ExclamationTriangleIcon className="w-8 h-8 text-warning-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Resolved
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockStats.resolvedIssues}
                      </p>
                    </div>
                    <CheckCircleIcon className="w-8 h-8 text-success-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Avg Response
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockStats.avgResponseTime}
                      </p>
                    </div>
                    <ClockIcon className="w-8 h-8 text-primary-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        AI Confidence
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(mockStats.confidenceScore * 100).toFixed(1)}%
                      </p>
                    </div>
                    <CpuChipIcon className="w-8 h-8 text-secondary-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Deployments
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockStats.deploymentsToday}
                      </p>
                    </div>
                    <RocketLaunchIcon className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockStats.successRate}%
                      </p>
                    </div>
                    <ChartBarIcon className="w-8 h-8 text-success-500" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pipeline Overview */}
          <motion.div variants={itemVariants}>
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title">Autonomous Pipeline Status</h2>
                    <p className="card-description">
                      Real-time view of the AI agent workflow integrating Kestra, Cline CLI, CodeRabbit, and Vercel
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
                  </div>
                </div>
              </div>
              <div className="card-content">
                <PipelineView />
              </div>
            </div>
          </motion.div>

          {/* Main Dashboard Grid */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Issues Summary */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">AI Issue Analysis</h2>
                  <p className="card-description">
                    Kestra AI Agent summaries from multiple monitoring sources
                  </p>
                </div>
                <div className="card-content">
                  <IssuesSummary />
                </div>
              </div>

              {/* Generated Fixes */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Cline CLI Generated Fixes</h2>
                  <p className="card-description">
                    Autonomous code generation and testing results
                  </p>
                </div>
                <div className="card-content">
                  <FixesGenerated />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Decision History and Deployments */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Decision History */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Autonomous Decisions</h2>
                  <p className="card-description">
                    AI decision-making history with confidence scores
                  </p>
                </div>
                <div className="card-content">
                  <DecisionHistory />
                </div>
              </div>

              {/* Deployment Timeline */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Vercel Deployments</h2>
                  <p className="card-description">
                    Automated deployment timeline and success metrics
                  </p>
                </div>
                <div className="card-content">
                  <DeploymentTimeline />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity Feed */}
          <motion.div variants={itemVariants}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Activity</h2>
                <p className="card-description">
                  Real-time feed of autonomous agent actions
                </p>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.severity === 'success' ? 'bg-success-500' :
                        activity.severity === 'high' ? 'bg-error-500' :
                        'bg-primary-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.timestamp.toLocaleTimeString()} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sponsor Integration Status */}
          <motion.div variants={itemVariants}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Hackathon Integration Status</h2>
                <p className="card-description">
                  Real-time status of all sponsor tool integrations
                </p>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-success-500" />
                    <div>
                      <p className="font-medium text-success-900 dark:text-success-100">Kestra</p>
                      <p className="text-sm text-success-700 dark:text-success-300">AI Agent Active</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-success-500" />
                    <div>
                      <p className="font-medium text-success-900 dark:text-success-100">Cline CLI</p>
                      <p className="text-sm text-success-700 dark:text-success-300">Code Generation Ready</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-success-500" />
                    <div>
                      <p className="font-medium text-success-900 dark:text-success-100">Vercel</p>
                      <p className="text-sm text-success-700 dark:text-success-300">Deployed Successfully</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-success-500" />
                    <div>
                      <p className="font-medium text-success-900 dark:text-success-100">CodeRabbit</p>
                      <p className="text-sm text-success-700 dark:text-success-300">Reviews Enabled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 mt-16">
        <div className="container-wide py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Built for AI Agents Assemble Hackathon by WeMakeDevs
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Competing for $12,000 in prizes
              </span>
              <div className="flex space-x-2">
                <span className="badge badge-primary">Kestra</span>
                <span className="badge badge-secondary">Cline CLI</span>
                <span className="badge badge-success">Vercel</span>
                <span className="badge badge-warning">CodeRabbit</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
