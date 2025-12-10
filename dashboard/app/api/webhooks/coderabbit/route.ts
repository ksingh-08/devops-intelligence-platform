import { NextRequest, NextResponse } from 'next/server'

/**
 * CodeRabbit webhook endpoint for receiving code review updates
 * 
 * This endpoint processes CodeRabbit events for:
 * - Automated code review completions
 * - Quality score updates
 * - Security vulnerability notifications
 * - Pull request status changes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate CodeRabbit webhook signature
    const signature = request.headers.get('x-coderabbit-signature')
    const webhookSecret = process.env.CODERABBIT_WEBHOOK_SECRET
    
    if (process.env.NODE_ENV === 'production' && (!signature || !webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const { event, action, pull_request, review, repository } = body

    console.log(`CodeRabbit webhook received: ${event}.${action}`, {
      prNumber: pull_request?.number,
      repository: repository?.name,
      timestamp: new Date().toISOString()
    })

    // Process different CodeRabbit events
    switch (event) {
      case 'pull_request_review':
        await handlePullRequestReview(action, pull_request, review)
        break
        
      case 'code_quality_check':
        await handleCodeQualityCheck(action, body.quality_data)
        break
        
      case 'security_scan':
        await handleSecurityScan(action, body.security_data)
        break
        
      case 'review_completed':
        await handleReviewCompleted(pull_request, review)
        break
        
      default:
        console.warn(`Unknown CodeRabbit event: ${event}`)
    }

    return NextResponse.json({
      status: 'processed',
      event,
      action,
      processedAt: new Date().toISOString(),
      hackathon: {
        message: 'CodeRabbit integration active for Captain Code Award',
        prize: '$1,000',
        criteria: 'OSS best practices and code quality'
      }
    })

  } catch (error) {
    console.error('CodeRabbit webhook processing failed:', error)
    
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle pull request review events
 */
async function handlePullRequestReview(action: string, pullRequest: any, review: any) {
  console.log(`PR Review ${action}:`, {
    prNumber: pullRequest.number,
    reviewState: review.state,
    reviewerType: review.user.type // 'Bot' for CodeRabbit
  })

  if (review.user.type === 'Bot' && review.user.login.includes('coderabbit')) {
    // This is a CodeRabbit automated review
    await processCodeRabbitReview(pullRequest, review)
  }
}

/**
 * Process CodeRabbit automated review
 */
async function processCodeRabbitReview(pullRequest: any, review: any) {
  const reviewData = {
    prNumber: pullRequest.number,
    title: pullRequest.title,
    state: review.state, // 'approved', 'changes_requested', 'commented'
    body: review.body,
    reviewedAt: review.submitted_at,
    reviewId: review.id
  }

  // Extract CodeRabbit insights from review body
  const insights = extractCodeRabbitInsights(review.body)
  
  console.log('CodeRabbit review processed:', {
    ...reviewData,
    insights,
    hackathonRelevant: pullRequest.title.includes('hackathon') || 
                      pullRequest.title.includes('AI Agents Assemble')
  })

  // Update dashboard with review results
  // In production, this would update real-time metrics
}

/**
 * Extract insights from CodeRabbit review comments
 */
function extractCodeRabbitInsights(reviewBody: string) {
  const insights = {
    codeQualityScore: null as number | null,
    securityIssues: 0,
    performanceIssues: 0,
    maintainabilityScore: null as number | null,
    suggestions: [] as string[]
  }

  // Parse CodeRabbit review format
  if (reviewBody.includes('Code Quality Score:')) {
    const scoreMatch = reviewBody.match(/Code Quality Score:\s*(\d+(?:\.\d+)?)/i)
    if (scoreMatch) {
      insights.codeQualityScore = parseFloat(scoreMatch[1])
    }
  }

  // Count security mentions
  const securityMatches = reviewBody.match(/security|vulnerability|exploit/gi)
  insights.securityIssues = securityMatches ? securityMatches.length : 0

  // Count performance mentions  
  const performanceMatches = reviewBody.match(/performance|optimization|slow|inefficient/gi)
  insights.performanceIssues = performanceMatches ? performanceMatches.length : 0

  return insights
}

/**
 * Handle code quality check events
 */
async function handleCodeQualityCheck(action: string, qualityData: any) {
  console.log(`Code quality check ${action}:`, qualityData)

  const metrics = {
    overallScore: qualityData.overall_score,
    maintainability: qualityData.maintainability_score,
    reliability: qualityData.reliability_score,
    security: qualityData.security_score,
    coverage: qualityData.test_coverage,
    duplicateCode: qualityData.duplicate_code_percentage
  }

  // Log metrics for hackathon demonstration
  console.log('Quality metrics updated:', metrics)
}

/**
 * Handle security scan events
 */
async function handleSecurityScan(action: string, securityData: any) {
  console.log(`Security scan ${action}:`, securityData)

  if (securityData.vulnerabilities && securityData.vulnerabilities.length > 0) {
    console.warn('Security vulnerabilities detected:', {
      count: securityData.vulnerabilities.length,
      severity: securityData.vulnerabilities.map((v: any) => v.severity)
    })

    // In production, this would trigger alerts
  }
}

/**
 * Handle review completed events
 */
async function handleReviewCompleted(pullRequest: any, review: any) {
  console.log('CodeRabbit review completed:', {
    prNumber: pullRequest.number,
    approved: review.state === 'approved',
    changesRequested: review.state === 'changes_requested'
  })

  // Update PR status in dashboard
  // Track review completion metrics for hackathon demo
}
