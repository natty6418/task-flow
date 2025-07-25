// Example usage of the enhanced ActivityLogService with diff data

import activityLogService from './activityLogService'

// Example: Logging a task update with diff
async function exampleTaskUpdate() {
  const userId = 'user-123'
  const taskId = 'task-456'
  
  // Simulate old and new task data
  const oldTask = {
    title: 'Fix login bug',
    description: 'The login form is not working properly',
    status: 'TODO',
    priority: 'HIGH',
    assignedToId: null,
    boardId: 'board-1',
    dueDate: null
  }

  const newTask = {
    title: 'Fix critical login bug',
    description: 'The login form is completely broken and needs immediate attention',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedToId: 'user-789',
    boardId: 'board-2',
    dueDate: new Date('2025-07-30')
  }

  // Log the task update with automatic diff generation
  const activityLog = await activityLogService.logTaskUpdated(
    userId,
    taskId,
    oldTask,
    newTask,
    'project-123',
    'board-2'
  )

  if (activityLog) {
    console.log('Activity logged:', activityLog.message)
    
    // Get detailed diff information
    const diffDetails = activityLogService.getDiffDetails(activityLog.diffData)
    console.log('Diff details:', JSON.stringify(diffDetails, null, 2))
    
    // Generate human-readable summary
    const diffSummary = activityLogService.generateDiffSummary(activityLog.diffData)
    console.log('Diff summary:', diffSummary)
  }
}

// Example: Retrieving activity logs with diff data
async function exampleRetrieveActivityLogs() {
  const projectId = 'project-123'
  
  // Get recent activity logs for a project
  const logs = await activityLogService.getProjectActivityLogs(projectId, 10)
  
  console.log('Recent activity logs:')
  logs.forEach(log => {
    console.log(`\n${log.createdAt.toISOString()}: ${log.message}`)
    
    if (log.diffData) {
      const diffDetails = activityLogService.getDiffDetails(log.diffData)
      if (diffDetails) {
        console.log(`  Fields changed: ${diffDetails.fieldsChanged.join(', ')}`)
        console.log(`  Change count: ${diffDetails.changeCount}`)
        
        // Show detailed changes
        Object.entries(diffDetails.changes).forEach(([field, change]: [string, any]) => {
          console.log(`    ${field}: ${change.oldValue} → ${change.newValue} (${change.type})`)
          
          // If there's a text diff, show it
          if (change.textDiff) {
            console.log(`    Text diff:`, change.textDiff)
          }
        })
      }
    }
  })
}

// Example: Working with text diffs
async function exampleTextDiff() {
  const diffData = {
    changes: {
      description: {
        oldValue: 'This is the old description',
        newValue: 'This is the updated and much more detailed description',
        type: 'modified',
        textDiff: [
          { value: 'This is the ', added: false, removed: false },
          { value: 'old', added: false, removed: true },
          { value: 'updated and much more detailed', added: true, removed: false },
          { value: ' description', added: false, removed: false }
        ]
      }
    }
  }

  // Get text diff for the description field
  const textDiff = activityLogService.getTextDiffForField(diffData, 'description')
  
  if (textDiff) {
    console.log('Text diff for description:')
    textDiff.forEach((part: any) => {
      if (part.added) {
        console.log(`+ ${part.value}`)
      } else if (part.removed) {
        console.log(`- ${part.value}`)
      } else {
        console.log(`  ${part.value}`)
      }
    })
  }
}

export {
  exampleTaskUpdate,
  exampleRetrieveActivityLogs,
  exampleTextDiff
}
