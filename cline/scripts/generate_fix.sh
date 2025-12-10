#!/bin/bash

# DevOps Intelligence Platform - Fix Generation Script
# This script executes Cline CLI to generate autonomous code fixes
# Built for AI Agents Assemble Hackathon

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="/tmp/cline-workspace"
OUTPUT_DIR="/tmp/cline-output"
CONFIG_FILE="${SCRIPT_DIR}/../config.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
DevOps Intelligence Platform - Fix Generation Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -i, --issue-id ID           Issue ID to generate fix for (required)
    -w, --workspace DIR         Workspace directory (default: /tmp/cline-workspace)
    -o, --output-dir DIR        Output directory (default: /tmp/cline-output)
    -c, --config FILE           Cline config file (default: ../config.json)
    -m, --model MODEL           AI model to use (default: from config)
    -t, --timeout SECONDS      Timeout for generation (default: 300)
    -a, --auto-approve          Auto-approve all Cline actions
    -v, --verbose               Verbose output
    -d, --dry-run               Dry run - don't make actual changes
    -h, --help                  Show this help

EXAMPLES:
    $0 -i "issue_001" --auto-approve
    $0 --issue-id "db_perf_001" --timeout 600 --verbose
    $0 -i "security_fix_001" --dry-run

ENVIRONMENT VARIABLES:
    CLINE_API_KEY              Cline API key (required)
    OPENAI_API_KEY             OpenAI API key (fallback)
    ANTHROPIC_API_KEY          Anthropic API key
    TOGETHER_API_KEY           Together AI API key
    GITHUB_TOKEN               GitHub token for repository access

EOF
}

# Parse command line arguments
parse_args() {
    ISSUE_ID=""
    MODEL=""
    TIMEOUT=300
    AUTO_APPROVE=false
    VERBOSE=false
    DRY_RUN=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -i|--issue-id)
                ISSUE_ID="$2"
                shift 2
                ;;
            -w|--workspace)
                WORKSPACE_DIR="$2"
                shift 2
                ;;
            -o|--output-dir)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            -m|--model)
                MODEL="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -a|--auto-approve)
                AUTO_APPROVE=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Validate required arguments
    if [[ -z "$ISSUE_ID" ]]; then
        error "Issue ID is required. Use -i or --issue-id"
        exit 1
    fi
    
    # Validate timeout
    if ! [[ "$TIMEOUT" =~ ^[0-9]+$ ]]; then
        error "Invalid timeout. Must be a positive integer"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites"
    
    # Check if Cline CLI is installed
    if ! command -v cline >/dev/null 2>&1; then
        error "Cline CLI is not installed or not in PATH"
        log "Please install Cline CLI: npm install -g @cline/cli"
        exit 1
    fi
    
    # Check API keys
    if [[ -z "${CLINE_API_KEY:-}" ]] && [[ -z "${OPENAI_API_KEY:-}" ]] && [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
        error "No API key found. Set CLINE_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY"
        exit 1
    fi
    
    # Check workspace exists
    if [[ ! -d "$WORKSPACE_DIR" ]]; then
        error "Workspace directory not found: $WORKSPACE_DIR"
        log "Run analyze_issue.sh first to prepare the workspace"
        exit 1
    fi
    
    # Check config file
    if [[ ! -f "$CONFIG_FILE" ]]; then
        warning "Config file not found: $CONFIG_FILE"
        log "Using default Cline configuration"
    fi
    
    success "Prerequisites check passed"
}

# Prepare Cline execution environment
prepare_environment() {
    log "Preparing Cline execution environment"
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Create execution log
    local exec_log="$OUTPUT_DIR/cline_execution_${ISSUE_ID}_$(date +%Y%m%d_%H%M%S).log"
    touch "$exec_log"
    
    # Set environment variables for Cline
    export CLINE_WORKSPACE="$WORKSPACE_DIR"
    export CLINE_OUTPUT_DIR="$OUTPUT_DIR"
    export CLINE_LOG_FILE="$exec_log"
    
    if [[ "$VERBOSE" == "true" ]]; then
        export CLINE_LOG_LEVEL="debug"
    else
        export CLINE_LOG_LEVEL="info"
    fi
    
    if [[ "$AUTO_APPROVE" == "true" ]]; then
        export CLINE_AUTO_APPROVE="true"
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        export CLINE_DRY_RUN="true"
    fi
    
    success "Environment prepared"
}

# Load issue context
load_issue_context() {
    log "Loading issue context for $ISSUE_ID"
    
    # Find analysis summary
    local analysis_file
    analysis_file=$(find "$OUTPUT_DIR" -name "analysis_summary_${ISSUE_ID}_*.json" | head -1)
    
    if [[ -z "$analysis_file" ]] || [[ ! -f "$analysis_file" ]]; then
        error "Analysis summary not found for issue $ISSUE_ID"
        log "Run analyze_issue.sh first to analyze the issue"
        exit 1
    fi
    
    # Load issue details from analysis
    ISSUE_DETAILS=$(cat "$analysis_file")
    ISSUE_SEVERITY=$(echo "$ISSUE_DETAILS" | python3 -c "import sys, json; print(json.load(sys.stdin)['severity'])")
    ISSUE_CONFIDENCE=$(echo "$ISSUE_DETAILS" | python3 -c "import sys, json; print(json.load(sys.stdin)['confidence_score'])")
    ISSUE_DESCRIPTION=$(echo "$ISSUE_DETAILS" | python3 -c "import sys, json; print(json.load(sys.stdin)['description'])")
    
    log "Issue loaded: $ISSUE_DESCRIPTION (severity: $ISSUE_SEVERITY, confidence: $ISSUE_CONFIDENCE)"
    success "Issue context loaded"
}

# Execute Cline CLI
execute_cline() {
    log "Executing Cline CLI for issue $ISSUE_ID"
    
    local start_time=$(date +%s)
    local cline_output="$OUTPUT_DIR/cline_output_${ISSUE_ID}_$(date +%Y%m%d_%H%M%S).json"
    local prompt_file="$WORKSPACE_DIR/analysis/cline_prompt.txt"
    
    # Build Cline command
    local cline_cmd="cline"
    
    # Add config if available
    if [[ -f "$CONFIG_FILE" ]]; then
        cline_cmd="$cline_cmd --config $CONFIG_FILE"
    fi
    
    # Add model if specified
    if [[ -n "$MODEL" ]]; then
        cline_cmd="$cline_cmd --model $MODEL"
    fi
    
    # Add workspace and output
    cline_cmd="$cline_cmd --workspace $WORKSPACE_DIR"
    cline_cmd="$cline_cmd --output $cline_output"
    
    # Add prompt file if available
    if [[ -f "$prompt_file" ]]; then
        cline_cmd="$cline_cmd --prompt-file $prompt_file"
    else
        # Use inline prompt
        cline_cmd="$cline_cmd --prompt \"Analyze and fix the production issue: $ISSUE_DESCRIPTION\""
    fi
    
    # Add auto-approve if enabled
    if [[ "$AUTO_APPROVE" == "true" ]]; then
        cline_cmd="$cline_cmd --auto-approve"
    fi
    
    # Add verbose if enabled
    if [[ "$VERBOSE" == "true" ]]; then
        cline_cmd="$cline_cmd --verbose"
    fi
    
    # Add dry-run if enabled
    if [[ "$DRY_RUN" == "true" ]]; then
        cline_cmd="$cline_cmd --dry-run"
    fi
    
    log "Executing: $cline_cmd"
    
    # Execute with timeout
    if timeout "$TIMEOUT" bash -c "$cline_cmd"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        success "Cline execution completed in ${duration}s"
        
        # Validate output
        if [[ -f "$cline_output" ]]; then
            success "Cline output saved to $cline_output"
            return 0
        else
            error "Cline output file not created"
            return 1
        fi
    else
        local exit_code=$?
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        if [[ $exit_code -eq 124 ]]; then
            error "Cline execution timed out after ${TIMEOUT}s"
        else
            error "Cline execution failed with exit code $exit_code after ${duration}s"
        fi
        return $exit_code
    fi
}

# Process Cline output
process_output() {
    log "Processing Cline output"
    
    local cline_output
    cline_output=$(find "$OUTPUT_DIR" -name "cline_output_${ISSUE_ID}_*.json" | head -1)
    
    if [[ ! -f "$cline_output" ]]; then
        error "Cline output file not found"
        return 1
    fi
    
    # Parse output
    local output_data
    output_data=$(cat "$cline_output")
    
    # Extract key information
    local files_modified
    local tests_created
    local commit_message
    
    files_modified=$(echo "$output_data" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    files = data.get('files_modified', [])
    print('\n'.join(files) if files else 'No files modified')
except:
    print('Error parsing output')
" 2>/dev/null || echo "Error parsing files")
    
    tests_created=$(echo "$output_data" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tests = data.get('tests_created', [])
    print('\n'.join(tests) if tests else 'No tests created')
except:
    print('Error parsing tests')
" 2>/dev/null || echo "Error parsing tests")
    
    commit_message=$(echo "$output_data" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('commit_message', 'Autonomous fix generated by Cline CLI'))
except:
    print('Autonomous fix generated by Cline CLI')
" 2>/dev/null || echo "Autonomous fix generated by Cline CLI")
    
    # Create processing summary
    local summary_file="$OUTPUT_DIR/fix_summary_${ISSUE_ID}_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$summary_file" << EOF
{
    "issue_id": "$ISSUE_ID",
    "fix_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "severity": "$ISSUE_SEVERITY",
    "confidence_score": $ISSUE_CONFIDENCE,
    "description": "$ISSUE_DESCRIPTION",
    "cline_output_file": "$cline_output",
    "files_modified": [
$(echo "$files_modified" | sed 's/.*/"&"/' | paste -sd, - 2>/dev/null || echo)
    ],
    "tests_created": [
$(echo "$tests_created" | sed 's/.*/"&"/' | paste -sd, - 2>/dev/null || echo)
    ],
    "commit_message": "$commit_message",
    "status": "fix_generated",
    "next_steps": [
        "Review generated fixes",
        "Run tests",
        "Create pull request",
        "Deploy to staging"
    ]
}
EOF
    
    success "Fix summary created at $summary_file"
    
    # Display summary
    if [[ "$VERBOSE" == "true" ]]; then
        log "Fix Generation Summary:"
        echo
        echo "Files Modified:"
        echo "$files_modified"
        echo
        echo "Tests Created:"
        echo "$tests_created"
        echo
        echo "Commit Message:"
        echo "$commit_message"
    fi
    
    return 0
}

# Create Git commit (if not dry run)
create_commit() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log "Dry run mode - skipping Git commit"
        return 0
    fi
    
    log "Creating Git commit for generated fixes"
    
    # Check if we're in a Git repository
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        warning "Not in a Git repository - skipping commit creation"
        return 0
    fi
    
    # Check if there are changes to commit
    if git diff --quiet && git diff --cached --quiet; then
        warning "No changes to commit"
        return 0
    fi
    
    # Create branch for the fix
    local branch_name="autonomous-fix/${ISSUE_ID}-$(date +%Y%m%d-%H%M%S)"
    
    if git checkout -b "$branch_name"; then
        log "Created branch: $branch_name"
    else
        warning "Failed to create branch, using current branch"
    fi
    
    # Stage all changes
    git add .
    
    # Create commit with detailed message
    local commit_msg="🤖 Autonomous fix: $ISSUE_DESCRIPTION

Generated by DevOps Intelligence Platform
- Issue ID: $ISSUE_ID
- Severity: $ISSUE_SEVERITY
- Confidence: $ISSUE_CONFIDENCE
- Generated by: Cline CLI
- Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

Files modified:
$(git diff --cached --name-only | sed 's/^/- /')

Co-authored-by: Cline CLI <cline@devops-intelligence.ai>"
    
    if git commit -m "$commit_msg"; then
        success "Commit created successfully"
        log "Branch: $branch_name"
        log "Commit: $(git rev-parse HEAD)"
        
        # Save branch info for later use
        echo "$branch_name" > "$OUTPUT_DIR/fix_branch_${ISSUE_ID}.txt"
        
        return 0
    else
        error "Failed to create commit"
        return 1
    fi
}

# Generate execution report
generate_report() {
    log "Generating execution report"
    
    local report_file="$OUTPUT_DIR/execution_report_${ISSUE_ID}_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# DevOps Intelligence Platform - Fix Generation Report

## Issue Information
- **Issue ID:** $ISSUE_ID
- **Severity:** $ISSUE_SEVERITY
- **Confidence Score:** $ISSUE_CONFIDENCE
- **Description:** $ISSUE_DESCRIPTION
- **Timestamp:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Execution Details
- **Workspace:** $WORKSPACE_DIR
- **Output Directory:** $OUTPUT_DIR
- **Config File:** $CONFIG_FILE
- **Model Used:** ${MODEL:-"Default from config"}
- **Timeout:** ${TIMEOUT}s
- **Auto Approve:** $AUTO_APPROVE
- **Dry Run:** $DRY_RUN

## Generated Files
$(find "$OUTPUT_DIR" -name "*${ISSUE_ID}*" -type f | sort | sed 's/^/- /')

## Git Information
$(if [[ -f "$OUTPUT_DIR/fix_branch_${ISSUE_ID}.txt" ]]; then
    echo "- **Branch Created:** $(cat "$OUTPUT_DIR/fix_branch_${ISSUE_ID}.txt")"
    echo "- **Commit:** $(git rev-parse HEAD 2>/dev/null || echo 'N/A')"
else
    echo "- **Git Status:** No commit created"
fi)

## Next Steps
1. Review the generated fixes in the output directory
2. Run tests to validate the changes
3. Create a pull request for code review
4. Deploy to staging environment for testing
5. Monitor the fix in production

## Files Generated
$(ls -la "$OUTPUT_DIR" | grep "$ISSUE_ID" | awk '{print "- " $9 " (" $5 " bytes, " $6 " " $7 " " $8 ")"}')

---
*Generated by DevOps Intelligence Platform*
*Cline CLI Integration for AI Agents Assemble Hackathon*
EOF
    
    success "Execution report generated at $report_file"
}

# Main execution
main() {
    log "Starting fix generation for DevOps Intelligence Platform"
    
    # Parse arguments
    parse_args "$@"
    
    # Execute fix generation pipeline
    check_prerequisites
    prepare_environment
    load_issue_context
    
    if execute_cline; then
        process_output
        create_commit
        generate_report
        
        success "Fix generation completed successfully for issue $ISSUE_ID"
        log "Output directory: $OUTPUT_DIR"
        log "Review the generated fixes and proceed with testing"
        
        # Print next steps
        echo
        echo "Next Steps:"
        echo "1. Review generated fixes: ls -la $OUTPUT_DIR"
        echo "2. Run tests: npm test (or appropriate test command)"
        echo "3. Create PR: create_tests.sh -i $ISSUE_ID"
        echo "4. Deploy to staging for validation"
        
        return 0
    else
        error "Fix generation failed for issue $ISSUE_ID"
        log "Check the logs in $OUTPUT_DIR for details"
        return 1
    fi
}

# Execute main function with all arguments
main "$@"
