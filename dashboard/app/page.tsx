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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-gray-900 sticky top-0 z-50">
        <div className="container-wide py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center glow-blue">
                  <CpuChipIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    DevOps Intelligence
                  </h1>
                  <p className="text-sm text-gray-400">
                    Autonomous Operations Dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse glow-green' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Current Time */}
              <div className="text-sm text-gray-400 font-mono">
                {currentTime.toLocaleTimeString()}
              </div>

              {/* Status Badge */}
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 text-green-400 px-4 py-1.5 rounded-full text-xs font-medium">
                Production
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

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="card hover-lift p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      Total Issues
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {mockStats.totalIssues}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      Resolved
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {mockStats.resolvedIssues}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      Avg Response
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {mockStats.avgResponseTime}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      AI Confidence
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {(mockStats.confidenceScore * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <CpuChipIcon className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      Deployments
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {mockStats.deploymentsToday}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <RocketLaunchIcon className="w-6 h-6 text-pink-500" />
                  </div>
                </div>
              </div>

              <div className="card hover-lift p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      Success Rate
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {mockStats.successRate}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pipeline Overview */}
          <motion.div variants={itemVariants}>
            <div className="card p-6">
              <div className="card-header pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Autonomous Pipeline Status</h2>
                    <p className="text-sm text-gray-400">
                      Real-time view of the AI agent workflow integrating Kestra, Cline CLI, CodeRabbit, and Vercel
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-400 font-medium">Live</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issues Summary */}
              <div className="card p-6">
                <div className="card-header pb-4 mb-6">
                  <h2 className="text-xl font-semibold text-white mb-1">AI Issue Analysis</h2>
                  <p className="text-sm text-gray-400">
                    Kestra AI Agent summaries from multiple monitoring sources
                  </p>
                </div>
                <div className="card-content">
                  <IssuesSummary />
                </div>
              </div>

              {/* Generated Fixes */}
              <div className="card p-6">
                <div className="card-header pb-4 mb-6">
                  <h2 className="text-xl font-semibold text-white mb-1">Cline CLI Generated Fixes</h2>
                  <p className="text-sm text-gray-400">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Decision History */}
              <div className="card p-6">
                <div className="card-header pb-4 mb-6">
                  <h2 className="text-xl font-semibold text-white mb-1">Autonomous Decisions</h2>
                  <p className="text-sm text-gray-400">
                    AI decision-making history with confidence scores
                  </p>
                </div>
                <div className="card-content">
                  <DecisionHistory />
                </div>
              </div>

              {/* Deployment Timeline */}
              <div className="card p-6">
                <div className="card-header pb-4 mb-6">
                  <h2 className="text-xl font-semibold text-white mb-1">Vercel Deployments</h2>
                  <p className="text-sm text-gray-400">
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
            <div className="card p-6">
              <div className="card-header pb-4 mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">Recent Activity</h2>
                <p className="text-sm text-gray-400">
                  Real-time feed of autonomous agent actions
                </p>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900/30 border border-gray-800 hover:border-gray-700 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.severity === 'success' ? 'bg-green-500 glow-green' :
                        activity.severity === 'high' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp.toLocaleTimeString()} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-900 mt-16">
        <div className="container-wide py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-400">
                DevOps Intelligence Platform - Autonomous Operations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">
                  System Status: Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
