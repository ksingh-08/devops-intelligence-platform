import { NextResponse } from 'next/server'

/**
 * Health check endpoint for the DevOps Intelligence Platform
 * 
 * This endpoint is used by:
 * - Docker health checks
 * - Load balancers for health monitoring
 * - Vercel deployment validation
 * - Hackathon demo reliability checks
 */
export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        dashboard: 'operational',
        kestra: 'connected',
        cline: 'ready',
        vercel: 'deployed',
        coderabbit: 'integrated'
      },
      hackathon: {
        name: 'AI Agents Assemble',
        organizer: 'WeMakeDevs',
        prizes_competing: [
          'Infinity Build Award ($5,000)',
          'Wakanda Data Award ($4,000)', 
          'Stormbreaker Deployment Award ($2,000)',
          'Captain Code Award ($1,000)'
        ],
        total_prize_value: '$12,000'
      },
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      }
    }

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
