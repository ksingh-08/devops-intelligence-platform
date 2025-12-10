/**
 * WebSocket client for real-time dashboard updates
 * 
 * This module provides real-time communication between the Vercel-hosted dashboard
 * and the Kestra workflows, enabling live demonstration of autonomous operations
 * for the AI Agents Assemble Hackathon.
 */

import { io, Socket } from 'socket.io-client'

export interface WorkflowUpdate {
  workflowId: string
  executionId: string
  status: 'running' | 'completed' | 'failed'
  timestamp: string
  data: any
  hackathonContext?: {
    demoMode: boolean
    prizeTarget: string
    liveDemo: boolean
  }
}

export interface MetricsUpdate {
  responseTimeImprovement: number
  costSavings: number
  uptimePercentage: number
  autonomousResolutionRate: number
  aiConfidence: number
  timestamp: string
}

class WebSocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      // Use the current domain for WebSocket connection
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:3000'

      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      })

      this.setupEventHandlers()
      
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.scheduleReconnect()
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected for hackathon demo')
      this.reconnectAttempts = 0
      
      // Join hackathon demo room
      this.socket?.emit('join-demo', {
        hackathon: 'AI Agents Assemble',
        timestamp: new Date().toISOString()
      })
    })

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ WebSocket disconnected:', reason)
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        this.scheduleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      this.scheduleReconnect()
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`)
    })
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect()
    }, this.reconnectInterval)
  }

  // Subscribe to workflow updates
  onWorkflowUpdate(callback: (update: WorkflowUpdate) => void) {
    this.socket?.on('workflow-update', callback)
  }

  // Subscribe to metrics updates
  onMetricsUpdate(callback: (metrics: MetricsUpdate) => void) {
    this.socket?.on('metrics-update', callback)
  }

  // Subscribe to Kestra events
  onKestraEvent(callback: (event: any) => void) {
    this.socket?.on('kestra-event', callback)
  }

  // Subscribe to Cline CLI events
  onClineEvent(callback: (event: any) => void) {
    this.socket?.on('cline-event', callback)
  }

  // Subscribe to CodeRabbit events
  onCodeRabbitEvent(callback: (event: any) => void) {
    this.socket?.on('coderabbit-event', callback)
  }

  // Send demo trigger (for live hackathon demonstration)
  triggerDemo(demoType: 'issue-detection' | 'code-generation' | 'deployment') {
    this.socket?.emit('demo-trigger', {
      type: demoType,
      timestamp: new Date().toISOString(),
      hackathon: 'AI Agents Assemble',
      prizeTarget: 'All four prizes ($12,000)'
    })
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  // Disconnect
  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  // Send heartbeat for demo reliability
  sendHeartbeat() {
    if (this.isConnected()) {
      this.socket?.emit('heartbeat', {
        timestamp: new Date().toISOString(),
        demo: 'active'
      })
    }
  }
}

// Singleton instance for the application
let wsClient: WebSocketClient | null = null

export const getWebSocketClient = (): WebSocketClient => {
  if (!wsClient) {
    wsClient = new WebSocketClient()
  }
  return wsClient
}

// Hook for React components
export const useWebSocket = () => {
  const client = getWebSocketClient()
  
  return {
    client,
    isConnected: client.isConnected(),
    triggerDemo: client.triggerDemo.bind(client),
    sendHeartbeat: client.sendHeartbeat.bind(client)
  }
}

// Mock WebSocket for development/demo when real WebSocket isn't available
export class MockWebSocketClient {
  private callbacks: { [event: string]: Function[] } = {}
  private demoInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startDemoMode()
  }

  private startDemoMode() {
    console.log('🎭 Mock WebSocket started for hackathon demo')
    
    // Simulate real-time updates every 10 seconds
    this.demoInterval = setInterval(() => {
      this.simulateWorkflowUpdate()
      this.simulateMetricsUpdate()
    }, 10000)
  }

  private simulateWorkflowUpdate() {
    const update: WorkflowUpdate = {
      workflowId: 'demo-workflow-' + Date.now(),
      executionId: 'exec-' + Math.random().toString(36).substr(2, 9),
      status: Math.random() > 0.1 ? 'completed' : 'running',
      timestamp: new Date().toISOString(),
      data: {
        issuesDetected: Math.floor(Math.random() * 5) + 1,
        fixesGenerated: Math.floor(Math.random() * 3) + 1,
        deploymentsTriggered: Math.random() > 0.7 ? 1 : 0
      },
      hackathonContext: {
        demoMode: true,
        prizeTarget: 'All four prizes ($12,000)',
        liveDemo: true
      }
    }

    this.emit('workflow-update', update)
  }

  private simulateMetricsUpdate() {
    const metrics: MetricsUpdate = {
      responseTimeImprovement: 90 + Math.random() * 8, // 90-98%
      costSavings: 45000 + Math.random() * 10000, // $45K-55K
      uptimePercentage: 99.8 + Math.random() * 0.2, // 99.8-100%
      autonomousResolutionRate: 80 + Math.random() * 15, // 80-95%
      aiConfidence: 0.8 + Math.random() * 0.15, // 80-95%
      timestamp: new Date().toISOString()
    }

    this.emit('metrics-update', metrics)
  }

  on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
  }

  private emit(event: string, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data))
    }
  }

  triggerDemo(demoType: string) {
    console.log(`🎬 Demo triggered: ${demoType}`)
    // Immediately simulate the requested demo
    this.simulateWorkflowUpdate()
    this.simulateMetricsUpdate()
  }

  isConnected(): boolean {
    return true // Always connected in mock mode
  }

  disconnect() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval)
      this.demoInterval = null
    }
    this.callbacks = {}
  }

  sendHeartbeat() {
    console.log('💓 Mock heartbeat sent')
  }
}

// Use mock client for demo reliability
export const getMockWebSocketClient = (): MockWebSocketClient => {
  return new MockWebSocketClient()
}
