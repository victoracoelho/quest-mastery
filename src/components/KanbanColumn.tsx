import { Droppable } from '@hello-pangea/dnd';
import { TopicCard } from '@/components/TopicCard';
import { Topic, Subject, KanbanColumn } from '@/types';
import { cn } from '@/lib/utils';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';

interface KanbanColumnProps {
  column: KanbanColumn;
  topics: Topic[];
  subjects: Subject[];
  targetDate: string;
  completedIds: string[];
  onTopicClick: (topic: Topic, subject: Subject) => void;
}

const columnConfig = {
  todo: {
    title: 'A Fazer',
    icon: ClipboardList,
    headerClass: 'bg-primary/10 text-primary',
    emptyText: 'Nenhum tópico pendente',
  },
  progress: {
    title: 'Em Progresso',
    icon: Clock,
    headerClass: 'bg-warning/10 text-warning',
    emptyText: 'Arraste tópicos para cá',
  },
  done: {
    title: 'Concluído',
    icon: CheckCircle2,
    headerClass: 'bg-success/10 text-success',
    emptyText: 'Nenhum tópico concluído ainda',
  },
};

export function KanbanColumnComponent({
  column,
  topics,
  subjects,
  targetDate,
  completedIds,
  onTopicClick,
}: KanbanColumnProps) {
  const config = columnConfig[column];
  const Icon = config.icon;

  const getSubject = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId) || { id: '', userId: '', name: 'Desconhecida', createdAt: '', isActive: false };
  };

  return (
    <div className="flex flex-col min-h-[400px] bg-muted/30 rounded-xl border border-border">
      {/* Column Header */}
      <div className={cn('p-4 rounded-t-xl border-b border-border', config.headerClass)}>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold">{config.title}</h3>
          <span className="ml-auto bg-background text-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            {topics.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={column}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-3 space-y-3 transition-colors',
              snapshot.isDraggingOver && 'bg-primary/5'
            )}
          >
            {topics.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                {config.emptyText}
              </div>
            ) : (
              topics.map((topic, index) => {
                const subject = getSubject(topic.subjectId);
                return (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    subject={subject}
                    index={index}
                    targetDate={targetDate}
                    onClick={() => onTopicClick(topic, subject)}
                    isCompleted={completedIds.includes(topic.id)}
                  />
                );
              })
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
