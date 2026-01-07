import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { TopicBadge } from '@/components/TopicBadge';
import { Topic, Subject } from '@/types';
import { getTopicStatus } from '@/services/planGenerator';
import { GripVertical, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
  subject: Subject;
  index: number;
  targetDate: string;
  onClick: () => void;
  isCompleted?: boolean;
}

export function TopicCard({ topic, subject, index, targetDate, onClick, isCompleted }: TopicCardProps) {
  const status = getTopicStatus(topic, targetDate);
  
  return (
    <Draggable draggableId={topic.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            snapshot.isDragging && 'shadow-lg ring-2 ring-primary/30',
            isCompleted && 'opacity-75'
          )}
          onClick={onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div
                {...provided.dragHandleProps}
                className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm leading-tight line-clamp-2">
                    {topic.title}
                  </h4>
                  <TopicBadge status={status} />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="w-3 h-3" />
                  <span className="truncate">{subject.name}</span>
                </div>
                
                {topic.lastScorePercent !== null && (
                  <div className="mt-2 text-xs">
                    <span className="text-muted-foreground">Último: </span>
                    <span className={cn(
                      'font-medium',
                      topic.lastScorePercent >= 80 ? 'text-success' :
                      topic.lastScorePercent >= 70 ? 'text-warning' : 'text-destructive'
                    )}>
                      {topic.lastScorePercent}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}
