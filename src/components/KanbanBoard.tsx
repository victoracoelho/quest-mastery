import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumnComponent } from '@/components/KanbanColumn';
import { Topic, Subject, KanbanColumn, DailyPlan } from '@/types';
import { getTopicById, updateTopic } from '@/repositories/topicRepository';
import { getSubjectById } from '@/repositories/subjectRepository';
import { markTopicCompleted, unmarkTopicCompleted } from '@/repositories/dailyPlanRepository';

interface KanbanBoardProps {
  plan: DailyPlan | null;
  subjects: Subject[];
  targetDate: string;
  isToday: boolean;
  onTopicClick: (topic: Topic, subject: Subject) => void;
  onCompleteRequest: (topic: Topic, subject: Subject) => void;
  onPlanUpdate: (plan: DailyPlan) => void;
}

interface ColumnData {
  todo: Topic[];
  progress: Topic[];
  done: Topic[];
}

export function KanbanBoard({
  plan,
  subjects,
  targetDate,
  isToday,
  onTopicClick,
  onCompleteRequest,
  onPlanUpdate,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnData>({ todo: [], progress: [], done: [] });
  const [columnAssignments, setColumnAssignments] = useState<Record<string, KanbanColumn>>({});

  // Initialize columns based on plan
  useEffect(() => {
    if (!plan) {
      setColumns({ todo: [], progress: [], done: [] });
      setColumnAssignments({});
      return;
    }

    const completedSet = new Set(plan.topicIdsCompleted);
    const todo: Topic[] = [];
    const done: Topic[] = [];
    
    // Restore previous column assignments from localStorage
    const savedAssignments = localStorage.getItem(`kanban_assignments_${plan.id}`);
    const assignments: Record<string, KanbanColumn> = savedAssignments 
      ? JSON.parse(savedAssignments) 
      : {};

    for (const topicId of plan.topicIdsSelected) {
      const topic = getTopicById(topicId);
      if (!topic) continue;

      if (completedSet.has(topicId)) {
        done.push(topic);
        assignments[topicId] = 'done';
      } else {
        // Check if it was previously in progress
        if (assignments[topicId] === 'progress') {
          // Will be handled in the progress filter below
        } else {
          todo.push(topic);
          assignments[topicId] = 'todo';
        }
      }
    }

    // Get progress items from saved assignments
    const progress: Topic[] = [];
    for (const topicId of plan.topicIdsSelected) {
      if (assignments[topicId] === 'progress' && !completedSet.has(topicId)) {
        const topic = getTopicById(topicId);
        if (topic) {
          progress.push(topic);
          // Remove from todo if it exists there
          const todoIdx = todo.findIndex(t => t.id === topicId);
          if (todoIdx !== -1) {
            todo.splice(todoIdx, 1);
          }
        }
      }
    }

    setColumns({ todo, progress, done });
    setColumnAssignments(assignments);
  }, [plan]);

  // Save assignments to localStorage when they change
  useEffect(() => {
    if (plan && Object.keys(columnAssignments).length > 0) {
      localStorage.setItem(`kanban_assignments_${plan.id}`, JSON.stringify(columnAssignments));
    }
  }, [columnAssignments, plan]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !plan || !isToday) return;

    const { source, destination, draggableId } = result;
    const sourceColumn = source.droppableId as KanbanColumn;
    const destColumn = destination.droppableId as KanbanColumn;

    if (sourceColumn === destColumn && source.index === destination.index) {
      return;
    }

    const topic = getTopicById(draggableId);
    if (!topic) return;

    const subject = getSubjectById(topic.subjectId);
    if (!subject) return;

    // If moving to 'done', trigger completion modal
    if (destColumn === 'done' && sourceColumn !== 'done') {
      // Move to done column visually first
      const newColumns = { ...columns };
      newColumns[sourceColumn] = newColumns[sourceColumn].filter(t => t.id !== draggableId);
      newColumns.done = [...newColumns.done];
      newColumns.done.splice(destination.index, 0, topic);
      setColumns(newColumns);
      
      // Trigger completion modal
      onCompleteRequest(topic, subject);
      return;
    }

    // If moving from 'done' to elsewhere (un-completing)
    if (sourceColumn === 'done' && destColumn !== 'done') {
      const updatedPlan = unmarkTopicCompleted(plan.id, draggableId);
      if (updatedPlan) {
        onPlanUpdate(updatedPlan);
      }
    }

    // Update columns
    const newColumns = { ...columns };
    newColumns[sourceColumn] = newColumns[sourceColumn].filter(t => t.id !== draggableId);
    newColumns[destColumn] = [...newColumns[destColumn]];
    newColumns[destColumn].splice(destination.index, 0, topic);

    // Update assignments
    const newAssignments = { ...columnAssignments };
    newAssignments[draggableId] = destColumn;

    setColumns(newColumns);
    setColumnAssignments(newAssignments);
  };

  const completedIds = plan?.topicIdsCompleted || [];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['todo', 'progress', 'done'] as KanbanColumn[]).map(column => (
          <KanbanColumnComponent
            key={column}
            column={column}
            topics={columns[column]}
            subjects={subjects}
            targetDate={targetDate}
            completedIds={completedIds}
            onTopicClick={onTopicClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
