#!/bin/bash

# DevOps Intelligence Platform - Issue Analysis Script
# This script prepares context for Cline CLI to analyze production issues
# Built for AI Agents Assemble Hackathon

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="/tmp/cline-workspace"
CONFIG_FILE="${SCRIPT_DIR}/../config.json"
OUTPUT_DIR="/tmp/cline-output"

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
DevOps Intelligence Platform - Issue Analysis Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -i, --issue-id ID           Issue ID to analyze (required)
    -s, --severity LEVEL        Issue severity (low|medium|high|critical)
    -c, --confidence SCORE      AI confidence score (0.0-1.0)
    -d, --description TEXT      Issue description
    -f, --context-file FILE     Additional context file
    -o, --output-dir DIR        Output directory (default: /tmp/cline-output)
    -v, --verbose               Verbose output
    -h, --help                  Show this help

EXAMPLES:
    $0 -i "issue_001" -s "high" -c "0.85" -d "Payment service timeout errors"
    $0 --issue-id "db_perf_001" --severity "medium" --context-file "/path/to/logs.txt"

ENVIRONMENT VARIABLES:
    CLINE_API_KEY              Cline API key (required)
    OPENAI_API_KEY             OpenAI API key (fallback)
    GITHUB_TOKEN               GitHub token for repository access
    ISSUE_ANALYSIS_TIMEOUT     Analysis timeout in seconds (default: 300)

EOF
}

# Parse command line arguments
parse_args() {
    ISSUE_ID=""
    SEVERITY="medium"
    CONFIDENCE="0.8"
    DESCRIPTION=""
    CONTEXT_FILES=()
    VERBOSE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -i|--issue-id)
                ISSUE_ID="$2"
                shift 2
                ;;
            -s|--severity)
                SEVERITY="$2"
                shift 2
                ;;
            -c|--confidence)
                CONFIDENCE="$2"
                shift 2
                ;;
            -d|--description)
                DESCRIPTION="$2"
                shift 2
                ;;
            -f|--context-file)
                CONTEXT_FILES+=("$2")
                shift 2
                ;;
            -o|--output-dir)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
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
    
    # Validate severity
    if [[ ! "$SEVERITY" =~ ^(low|medium|high|critical)$ ]]; then
        error "Invalid severity. Must be one of: low, medium, high, critical"
        exit 1
    fi
    
    # Validate confidence score
    if ! python3 -c "assert 0.0 <= float('$CONFIDENCE') <= 1.0" 2>/dev/null; then
        error "Invalid confidence score. Must be between 0.0 and 1.0"
        exit 1
    fi
}

# Setup workspace
setup_workspace() {
    log "Setting up workspace at $WORKSPACE_DIR"
    
    # Create workspace directory
    mkdir -p "$WORKSPACE_DIR"
    mkdir -p "$OUTPUT_DIR"
    
    # Create subdirectories
    mkdir -p "$WORKSPACE_DIR/context"
    mkdir -p "$WORKSPACE_DIR/analysis"
    mkdir -p "$WORKSPACE_DIR/fixes"
    mkdir -p "$WORKSPACE_DIR/tests"
    
    # Copy configuration
    if [[ -f "$CONFIG_FILE" ]]; then
        cp "$CONFIG_FILE" "$WORKSPACE_DIR/cline-config.json"
    else
        warning "Cline config file not found at $CONFIG_FILE"
    fi
    
    success "Workspace setup complete"
}

# Collect system context
collect_system_context() {
    log "Collecting system context for issue $ISSUE_ID"
    
    local context_file="$WORKSPACE_DIR/context/system_context.json"
    
    # Create system context JSON
    cat > "$context_file" << EOF
{
    "issue_id": "$ISSUE_ID",
    "severity": "$SEVERITY",
    "confidence_score": $CONFIDENCE,
    "description": "$DESCRIPTION",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "analysis_start_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "system_info": {
        "hostname": "$(hostname)",
        "os": "$(uname -s)",
        "arch": "$(uname -m)",
        "kernel": "$(uname -r)",
        "uptime": "$(uptime)"
    },
    "environment": {
        "node_env": "${NODE_ENV:-development}",
        "deployment_env": "${DEPLOYMENT_ENV:-local}",
        "region": "${AWS_REGION:-us-east-1}",
        "cluster": "${CLUSTER_NAME:-default}"
    },
    "git_info": {
        "branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
        "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
        "dirty": $(git diff --quiet 2>/dev/null && echo 'false' || echo 'true')
    }
}
EOF
    
    success "System context collected at $context_file"
}

# Collect error logs and context files
collect_context_files() {
    log "Collecting context files"
    
    local context_dir="$WORKSPACE_DIR/context"
    
    # Copy provided context files
    for file in "${CONTEXT_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            local basename=$(basename "$file")
            cp "$file" "$context_dir/$basename"
            log "Copied context file: $basename"
        else
            warning "Context file not found: $file"
        fi
    done
    
    # Collect recent logs if available
    if command -v journalctl >/dev/null 2>&1; then
        log "Collecting system logs"
        journalctl --since "5 minutes ago" --no-pager > "$context_dir/system_logs.txt" 2>/dev/null || true
    fi
    
    # Collect Docker logs if available
    if command -v docker >/dev/null 2>&1; then
        log "Collecting Docker logs"
        docker ps --format "table {{.Names}}\t{{.Status}}" > "$context_dir/docker_status.txt" 2>/dev/null || true
        
        # Get logs from running containers
        docker ps --format "{{.Names}}" | head -5 | while read container; do
            if [[ -n "$container" ]]; then
                docker logs --tail=100 --since=5m "$container" > "$context_dir/docker_${container}.log" 2>/dev/null || true
            fi
        done
    fi
    
    # Collect Kubernetes logs if available
    if command -v kubectl >/dev/null 2>&1; then
        log "Collecting Kubernetes logs"
        kubectl get pods --all-namespaces > "$context_dir/k8s_pods.txt" 2>/dev/null || true
        kubectl get events --sort-by='.lastTimestamp' | tail -20 > "$context_dir/k8s_events.txt" 2>/dev/null || true
    fi
    
    success "Context files collected"
}

# Analyze repository structure
analyze_repository() {
    log "Analyzing repository structure"
    
    local analysis_file="$WORKSPACE_DIR/analysis/repo_structure.json"
    
    # Find relevant files based on issue type and description
    local relevant_files=()
    
    # Look for files related to the issue
    if [[ "$DESCRIPTION" =~ [Pp]ayment ]]; then
        mapfile -t payment_files < <(find . -name "*.js" -o -name "*.ts" -o -name "*.py" | grep -i payment | head -10)
        relevant_files+=("${payment_files[@]}")
    fi
    
    if [[ "$DESCRIPTION" =~ [Dd]atabase ]]; then
        mapfile -t db_files < <(find . -name "*.sql" -o -name "*migration*" -o -name "*model*" | head -10)
        relevant_files+=("${db_files[@]}")
    fi
    
    if [[ "$DESCRIPTION" =~ [Aa]uth ]]; then
        mapfile -t auth_files < <(find . -name "*.js" -o -name "*.ts" -o -name "*.py" | grep -i auth | head -10)
        relevant_files+=("${auth_files[@]}")
    fi
    
    # Default: find recently modified files
    if [[ ${#relevant_files[@]} -eq 0 ]]; then
        mapfile -t recent_files < <(find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" \) -mtime -7 | head -20)
        relevant_files+=("${recent_files[@]}")
    fi
    
    # Create repository analysis
    cat > "$analysis_file" << EOF
{
    "issue_id": "$ISSUE_ID",
    "analysis_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "repository": {
        "root": "$(pwd)",
        "total_files": $(find . -type f | wc -l),
        "code_files": $(find . -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" | wc -l),
        "relevant_files": [
EOF
    
    # Add relevant files to JSON
    local first=true
    for file in "${relevant_files[@]}"; do
        if [[ -f "$file" ]]; then
            if [[ "$first" == "true" ]]; then
                first=false
            else
                echo "," >> "$analysis_file"
            fi
            echo -n "            {" >> "$analysis_file"
            echo -n "\"path\": \"$file\", " >> "$analysis_file"
            echo -n "\"size\": $(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0), " >> "$analysis_file"
            echo -n "\"modified\": \"$(stat -f%Sm -t%Y-%m-%dT%H:%M:%SZ "$file" 2>/dev/null || stat -c%y "$file" 2>/dev/null | cut -d' ' -f1)T$(stat -c%y "$file" 2>/dev/null | cut -d' ' -f2 | cut -d'.' -f1)Z\"" >> "$analysis_file"
            echo -n "}" >> "$analysis_file"
        fi
    done
    
    cat >> "$analysis_file" << EOF

        ]
    },
    "file_tree": "$(tree -L 3 -I 'node_modules|.git|*.log' 2>/dev/null || find . -type d -name 'node_modules' -prune -o -type d -name '.git' -prune -o -type f -print | head -50)"
}
EOF
    
    success "Repository analysis complete at $analysis_file"
}

# Prepare Cline prompt
prepare_cline_prompt() {
    log "Preparing Cline CLI prompt"
    
    local prompt_file="$WORKSPACE_DIR/analysis/cline_prompt.txt"
    
    # Read system context
    local system_context=""
    if [[ -f "$WORKSPACE_DIR/context/system_context.json" ]]; then
        system_context=$(cat "$WORKSPACE_DIR/context/system_context.json")
    fi
    
    # Read repository analysis
    local repo_analysis=""
    if [[ -f "$WORKSPACE_DIR/analysis/repo_structure.json" ]]; then
        repo_analysis=$(cat "$WORKSPACE_DIR/analysis/repo_structure.json")
    fi
    
    # List context files
    local context_files_list=""
    if [[ -d "$WORKSPACE_DIR/context" ]]; then
        context_files_list=$(ls -la "$WORKSPACE_DIR/context/" | tail -n +2)
    fi
    
    # Create comprehensive prompt
    cat > "$prompt_file" << EOF
## Production Issue Analysis Request

**Issue ID:** $ISSUE_ID
**Severity:** $SEVERITY
**Confidence Score:** $CONFIDENCE
**Source:** DevOps Intelligence Platform

**Issue Description:**
$DESCRIPTION

**System Context:**
$system_context

**Repository Analysis:**
$repo_analysis

**Available Context Files:**
$context_files_list

**Analysis Request:**
Please analyze this production issue and generate the appropriate code fix. Consider:

1. **Root Cause Analysis**: Examine the error patterns and system state
2. **Impact Assessment**: Understand the scope and severity of the issue
3. **Fix Strategy**: Determine the minimal, safest fix approach
4. **Testing Requirements**: Identify what tests need to be created/updated
5. **Deployment Considerations**: Consider rollback and monitoring needs

**Output Requirements:**
- Generate production-ready code fixes
- Include comprehensive error handling
- Add appropriate logging and monitoring
- Create or update relevant tests
- Provide clear commit messages and PR descriptions
- Consider performance and security implications

**Context Files Available:**
$(find "$WORKSPACE_DIR/context" -type f -name "*.txt" -o -name "*.log" -o -name "*.json" | sort)

Please proceed with the analysis and fix generation.
EOF
    
    success "Cline prompt prepared at $prompt_file"
}

# Generate analysis summary
generate_summary() {
    log "Generating analysis summary"
    
    local summary_file="$OUTPUT_DIR/analysis_summary_${ISSUE_ID}_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$summary_file" << EOF
{
    "analysis_id": "analysis_${ISSUE_ID}_$(date +%Y%m%d_%H%M%S)",
    "issue_id": "$ISSUE_ID",
    "severity": "$SEVERITY",
    "confidence_score": $CONFIDENCE,
    "description": "$DESCRIPTION",
    "analysis_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "workspace_path": "$WORKSPACE_DIR",
    "output_path": "$OUTPUT_DIR",
    "status": "ready_for_cline",
    "context_files": [
$(find "$WORKSPACE_DIR/context" -type f | sed 's/.*/"&"/' | paste -sd, -)
    ],
    "analysis_files": [
$(find "$WORKSPACE_DIR/analysis" -type f | sed 's/.*/"&"/' | paste -sd, -)
    ],
    "next_steps": [
        "Run Cline CLI with prepared context",
        "Generate code fixes",
        "Create tests",
        "Validate changes",
        "Create pull request"
    ],
    "cline_command": "cline --config $WORKSPACE_DIR/cline-config.json --prompt-file $WORKSPACE_DIR/analysis/cline_prompt.txt --output-dir $OUTPUT_DIR --workspace $WORKSPACE_DIR"
}
EOF
    
    success "Analysis summary generated at $summary_file"
    
    if [[ "$VERBOSE" == "true" ]]; then
        log "Analysis Summary:"
        cat "$summary_file" | python3 -m json.tool
    fi
}

# Main execution
main() {
    log "Starting issue analysis for DevOps Intelligence Platform"
    
    # Check dependencies
    if ! command -v python3 >/dev/null 2>&1; then
        error "Python 3 is required but not installed"
        exit 1
    fi
    
    if ! command -v git >/dev/null 2>&1; then
        warning "Git not available - some context will be missing"
    fi
    
    # Parse arguments
    parse_args "$@"
    
    # Execute analysis steps
    setup_workspace
    collect_system_context
    collect_context_files
    analyze_repository
    prepare_cline_prompt
    generate_summary
    
    success "Issue analysis complete for $ISSUE_ID"
    log "Workspace: $WORKSPACE_DIR"
    log "Output: $OUTPUT_DIR"
    log "Ready for Cline CLI execution"
    
    # Print next steps
    echo
    echo "Next Steps:"
    echo "1. Review the analysis summary in $OUTPUT_DIR"
    echo "2. Run generate_fix.sh to execute Cline CLI"
    echo "3. Review generated fixes"
    echo "4. Create pull request with create_tests.sh"
    
    return 0
}

# Execute main function with all arguments
main "$@"
