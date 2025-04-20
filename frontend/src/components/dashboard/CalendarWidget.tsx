'use client';

import * as React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import dayjs, { Dayjs } from 'dayjs';
import SectionCard from './SectionCard';
import { Task } from '@/types/type';
import { useAuth } from '@/contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';



export default function CalendarWidget() {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs());
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(dayjs());

  const { tasks } = useAuth();
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
  const selectedTasks =
    selectedDate && taskMap[selectedDate.format('YYYY-MM-DD')] || [];

  const ServerDay = (props: PickersDayProps) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const key = day.format('YYYY-MM-DD');
    const dayTasks = taskMap[key] || [];

    return (
      <div className="relative">
        <PickersDay 
          {...other} 
          outsideCurrentMonth={outsideCurrentMonth} 
          day={day} 
        />
        {dayTasks.length > 0 && (
          <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 flex gap-[2px]">
            {dayTasks.slice(0, 3).map((task, index) => {
              const color =
                task.status === 'DONE'
                  ? 'bg-green-500'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-blue-400'
                  : 'bg-gray-400';
              return (
                <span
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${color}`}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <SectionCard title="Calendar" className="min-h-[200px]">
      <LocalizationProvider dateAdapter={AdapterDayjs}>


        <DateCalendar
          className='border-2 border-gray-200 rounded-lg'
          value={value}
          onChange={(val)=>{
            setValue(val);
            setSelectedDate(val);
          }}
          disableHighlightToday={false}
          showDaysOutsideCurrentMonth
          slots={{ day: ServerDay }}
        />
        <div className="mt-6 bg-white p-4 rounded-xl shadow border border-gray-200">
  <h3 className="text-base font-semibold text-gray-800 mb-3">
    Tasks on {selectedDate?.format('MMM D, YYYY')}
  </h3>

  {selectedTasks.length > 0 ? (
    <ul className="space-y-2">
      {selectedTasks.map((task) => (
        <li
          key={task.id}
          className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex justify-between items-center mb-1">
            <p className="font-medium text-gray-800">{task.title}</p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                task.status === 'DONE'
                  ? 'bg-green-100 text-green-700'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-400 text-sm italic">No tasks on this date</p>
  )}
</div>

      </LocalizationProvider>
    </SectionCard>
  );
}
