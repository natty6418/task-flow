'use client';

import * as React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import dayjs, { Dayjs } from 'dayjs';
import SectionCard from './SectionCard';
import { Task } from '@/types/type';
import { useApp } from "@/contexts/AppContext";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface CalendarWidgetProps {
  onDateSelect?: (date: Date | null) => void;
  selectedDate?: Date | null;
}

export default function CalendarWidget({ onDateSelect, selectedDate }: CalendarWidgetProps) {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs());
  const [internalSelectedDate, setInternalSelectedDate] = React.useState<Dayjs | null>(
    selectedDate ? dayjs(selectedDate) : null
  );

  const { tasks } = useApp();
  
  // Precompute task map for quick lookup
  const taskMap = React.useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = dayjs(task.dueDate).format('YYYY-MM-DD');
      map[key] = [...(map[key] || []), task];
    }
    return map;
  }, [tasks]);

  const currentSelectedDate = selectedDate ? dayjs(selectedDate) : internalSelectedDate;
  const selectedTasks = currentSelectedDate && taskMap[currentSelectedDate.format('YYYY-MM-DD')] || [];

  const handleDateChange = (newValue: Dayjs | null) => {
    setValue(newValue);
    setInternalSelectedDate(newValue);
    
    // Call parent callback if provided
    if (onDateSelect) {
      onDateSelect(newValue ? newValue.toDate() : null);
    }
  };

  const handleDateClick = (date: Dayjs) => {
    const dateToSelect = currentSelectedDate && currentSelectedDate.isSame(date, 'day') ? null : date;
    setInternalSelectedDate(dateToSelect);
    
    // Call parent callback if provided
    if (onDateSelect) {
      onDateSelect(dateToSelect ? dateToSelect.toDate() : null);
    }
  };

  const ServerDay = (props: PickersDayProps) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const key = day.format('YYYY-MM-DD');
    const dayTasks = taskMap[key] || [];
    const isSelected = currentSelectedDate && currentSelectedDate.isSame(day, 'day');

    return (
      <div className="relative">
        <PickersDay 
          {...other} 
          outsideCurrentMonth={outsideCurrentMonth} 
          day={day}
          selected={!!isSelected}
          onClick={() => handleDateClick(day)}
          sx={{
            ...(isSelected && {
              backgroundColor: '#3B82F6 !important',
              color: 'white !important',
              '&:hover': {
                backgroundColor: '#2563EB !important',
              }
            })
          }}
        />
        {dayTasks.length > 0 && (
          <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 flex gap-[2px]">
            {dayTasks.slice(0, 3).map((task, index) => {
              const color =
                task.status === 'DONE'
                  ? 'bg-green-500'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-blue-500'
                  : 'bg-orange-500';
              return (
                <div
                  key={`${task.id}-${index}`}
                  className={`w-[4px] h-[4px] rounded-full ${color}`}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <SectionCard title="Calendar" className="min-h-[400px]">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={value}
          onChange={handleDateChange}
          slots={{
            day: ServerDay as React.ComponentType<PickersDayProps>,
          }}
          sx={{
            '& .MuiPickersCalendarHeader-root': {
              paddingLeft: '8px',
              paddingRight: '8px',
              marginBottom: '8px',
            },
            '& .MuiDayCalendar-root': {
              margin: 0,
            },
            '& .MuiPickersDay-root': {
              fontSize: '0.875rem',
              margin: '2px',
            },
            width: '100%',
          }}
        />
      </LocalizationProvider>
      
      {/* Show selected date tasks */}
      {currentSelectedDate && selectedTasks.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">
            Tasks on {currentSelectedDate.format('MMM D, YYYY')}
          </h4>
          <div className="space-y-1">
            {selectedTasks.map((task) => (
              <div key={task.id} className="text-sm text-gray-700 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'DONE' ? 'bg-green-500' : 
                  task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-orange-500'
                }`} />
                {task.title}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Clear selection button */}
      {currentSelectedDate && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setInternalSelectedDate(null);
              if (onDateSelect) {
                onDateSelect(null);
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Show all tasks
          </button>
        </div>
      )}
    </SectionCard>
  );
}
