import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Tooltip, Typography, Tag, Popconfirm, Popover } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

import type { IWashingPost } from '../../types/washingPost';
import type { IWashingPostSchedule } from '../../types/washingPostSchedule';
import type { IBooking } from '../../types/booking';
import type { ITimeBlock } from '../../types/timeBlock';
import { pluralizeRu } from '../../utils/stringUtils';
import { generateTimeMarks } from '../../utils/timelineUtils';

import styles from './Timeline.module.scss';

const { Text } = Typography;

interface ITimelineProps {
  date: Date;
  posts: IWashingPost[];
  schedules?: IWashingPostSchedule[];
  bookings?: IBooking[];
  blocks?: ITimeBlock[];
  onDateChange: (date: Date) => void;
  onOccupyClick?: (data: { postId: string; startAt: Date }) => void;
  onDeleteBlock?: (blockId: string) => void;
  startHour?: number;
  endHour?: number;
  stepMinutes?: number;
}

function getBookingStatusText(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Ожидает';
    case 'CONFIRMED':
      return 'Подтверждена';
    case 'CANCELLED':
      return 'Отменена';
    case 'COMPLETED':
      return 'Завершена';
    default:
      return status;
  }
}

function getBookingStatusColor(status: IBooking['status']): string {
  switch (status) {
    case 'PENDING':
      return 'orange';
    case 'CONFIRMED':
      return 'green';
    case 'CANCELLED':
      return 'red';
    case 'COMPLETED':
      return 'blue';
    default:
      return 'default';
  }
}

function Timeline(props: ITimelineProps) {
  const {
    date,
    posts,
    schedules,
    bookings,
    blocks,
    onDateChange,
    onOccupyClick,
    onDeleteBlock,
    startHour = 10,
    endHour = 20,
    stepMinutes = 30,
  } = props;

  // Нужен, чтобы "прошедшее время" дизейблилось даже без других перерисовок.
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowTs(Date.now()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const day = useMemo(() => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [date]);

  const todayStartTs = useMemo(() => {
    const t = new Date(nowTs);
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, [nowTs]);

  const isPastDay = day.getTime() < todayStartTs;
  const isToday = day.getTime() === todayStartTs;

  const schedulesByPostId = useMemo(() => {
    const map = new Map<string, IWashingPostSchedule>();
    for (const s of schedules ?? []) {
      map.set(s.postId, s);
    }
    return map;
  }, [schedules]);

  const computedHours = useMemo(() => {
    const activeSchedules = (schedules ?? []).filter((s) => s.isActive);
    if (activeSchedules.length === 0) {
      return { startHour, endHour };
    }
    const minFrom = Math.min(...activeSchedules.map((s) => s.workFromMinutes));
    const maxTo = Math.max(...activeSchedules.map((s) => s.workToMinutes));
    return {
      startHour: Math.floor(minFrom / 60),
      endHour: Math.ceil(maxTo / 60),
    };
  }, [schedules, startHour, endHour]);

  const timeMarks = useMemo(
    () => generateTimeMarks({ startHour: computedHours.startHour, endHour: computedHours.endHour, stepMinutes }),
    [computedHours.startHour, computedHours.endHour, stepMinutes]
  );

  const timeColumnsCount = Math.max(1, timeMarks.length - 1);
  const colTemplate = useMemo(() => {
    // 1-я колонка — названия постов, остальные — интервалы времени
    return `220px repeat(${timeColumnsCount}, minmax(64px, 1fr))`;
  }, [timeColumnsCount]);

  const rowTemplate = useMemo(() => {
    // 1-я строка — времена, остальные — посты
    return `44px repeat(${Math.max(1, posts.length)}, 52px)`;
  }, [posts.length]);

  const bookingsByPostId = useMemo(() => {
    const map = new Map<string, IBooking[]>();
    for (const b of bookings ?? []) {
      const postId = b.postId;
      if (!postId) continue;
      const list = map.get(postId) ?? [];
      list.push(b);
      map.set(postId, list);
    }
    return map;
  }, [bookings]);

  const blocksByPostId = useMemo(() => {
    const map = new Map<string, ITimeBlock[]>();
    for (const bl of blocks ?? []) {
      const list = map.get(bl.postId) ?? [];
      list.push(bl);
      map.set(bl.postId, list);
    }
    return map;
  }, [blocks]);

  const onDatePickerChange = (value: Dayjs | null) => {
    if (!value) return;
    onDateChange(value.toDate());
  };

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            icon={<LeftOutlined />}
            onClick={() => {
              const prev = new Date(day);
              prev.setDate(prev.getDate() - 1);
              onDateChange(prev);
            }}
          />
          <Button
            icon={<RightOutlined />}
            onClick={() => {
              const next = new Date(day);
              next.setDate(next.getDate() + 1);
              onDateChange(next);
            }}
          />
          <DatePicker
            value={dayjs(day)}
            onChange={onDatePickerChange}
            format="DD.MM.YYYY"
            allowClear={false}
          />
        </div>

        <Text type="secondary">
          {posts.length} {pluralizeRu(posts.length, 'пост', 'поста', 'постов')}, интервал {String(computedHours.startHour).padStart(2, '0')}:00–{String(computedHours.endHour).padStart(2, '0')}:00
        </Text>
      </div>

      <div className={styles.gridWrapper}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: colTemplate,
            gridTemplateRows: rowTemplate,
          }}
        >
          {/* Corner */}
          <div className={`${styles.cell} ${styles.cornerCell}`}>
            <Text strong>Пост / Время</Text>
          </div>

          {/* Time header */}
          {Array.from({ length: timeColumnsCount }).map((_, idx) => (
            <div
              key={`t-${idx}`}
              className={`${styles.cell} ${styles.timeCell}`}
              style={{ gridColumn: idx + 2, gridRow: 1 }}
            >
              {timeMarks[idx]?.label}
            </div>
          ))}

          {/* Post rows */}
          {posts.map((post, rowIdx) => {
            const row = rowIdx + 2;
            const schedule = schedulesByPostId.get(post.id);
            // По правилам: пока администратор явно не включил пост на конкретный день (расписанием),
            // считаем его неактивным для этого дня.
            const dayActive = schedule?.isActive ?? false;
            const hoursText = dayActive && schedule
              ? `${String(Math.floor(schedule.workFromMinutes / 60)).padStart(2, '0')}:${String(schedule.workFromMinutes % 60).padStart(2, '0')}–${String(Math.floor(schedule.workToMinutes / 60)).padStart(2, '0')}:${String(schedule.workToMinutes % 60).padStart(2, '0')}`
              : '';

            return (
              <div key={post.id} style={{ display: 'contents' }}>
                <div
                  className={`${styles.cell} ${styles.postCell} ${!dayActive ? styles.inactivePost : ''}`}
                  style={{ gridColumn: 1, gridRow: row }}
                >
                  <Text strong>{post.name}</Text>
                  {!dayActive && <Tag>неактивен</Tag>}
                  {hoursText && <Tag>{hoursText}</Tag>}
                </div>

                {Array.from({ length: timeColumnsCount }).map((_, colIdx) => {
                  const cellStartMinutes = computedHours.startHour * 60 + colIdx * stepMinutes;
                  const cellStartAt = new Date(day.getTime() + cellStartMinutes * 60 * 1000);
                  const isPastCell = isPastDay || (isToday && cellStartAt.getTime() < nowTs);
                  const scheduleAllows =
                    dayActive &&
                    schedule &&
                    cellStartMinutes >= schedule.workFromMinutes &&
                    cellStartMinutes < schedule.workToMinutes;

                  const canOccupy = Boolean(onOccupyClick) && scheduleAllows && !isPastCell;

                  const handleCellClick = () => {
                    if (!onOccupyClick || !canOccupy) return;
                    onOccupyClick({ postId: post.id, startAt: cellStartAt });
                  };

                  return (
                    <div
                      key={`${post.id}-bg-${colIdx}`}
                      className={`${styles.cell} ${!canOccupy ? styles.disabledCell : ''}`}
                      style={{
                        gridColumn: colIdx + 2,
                        gridRow: row,
                        cursor: canOccupy ? 'crosshair' : undefined,
                      }}
                      onClick={canOccupy ? handleCellClick : undefined}
                    />
                  );
                })}

                {/* Slot blocks */}
                {(bookingsByPostId.get(post.id) ?? [])
                  .filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED')
                  .map((b) => {
                    const start = new Date(b.startAt);
                    const dur = b.durationMinutes;
                    const end = new Date(start.getTime() + dur * 60 * 1000);

                    // вычислим колонки по 30-мин сетке
                    const gridStart = new Date(day);
                    gridStart.setHours(computedHours.startHour, 0, 0, 0);
                    const minutesFromStart = Math.floor((start.getTime() - gridStart.getTime()) / 60000);
                    const startIndex = Math.floor(minutesFromStart / stepMinutes);
                    const span = Math.max(1, Math.ceil(dur / stepMinutes));
                    const startCol = startIndex + 2;
                    const endCol = startCol + span;

                    const className = [
                      styles.slotBlock,
                      b.status === 'PENDING' ? styles.slotPending : styles.slotConfirmed,
                    ].join(' ');

                    const title = (
                      <div style={{ color: '#fff' }}>
                        <div>
                          <Text strong style={{ color: 'inherit' }}>
                            {start.toLocaleString('ru-RU')}
                          </Text>
                          <div>
                            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>
                              До: {end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </div>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Tag color={getBookingStatusColor(b.status)}>{getBookingStatusText(b.status)}</Tag>
                          <div>
                            <Text style={{ color: 'inherit' }}>
                              {b.user?.firstName ?? ''} {b.user?.lastName ?? ''}{' '}
                              {b.user?.phone ? `(${b.user.phone})` : ''}
                            </Text>
                          </div>
                          <div>
                            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>
                              {b.car?.brand ?? ''} {b.car?.model ?? ''}{' '}
                              {b.car?.licensePlate ? `(${b.car.licensePlate})` : ''}
                            </Text>
                          </div>
                          <div>
                            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>{b.service?.name}</Text>
                          </div>
                        </div>
                      </div>
                    );

                    return (
                      <Tooltip key={b.id} title={title} placement="topLeft" styles={{ root: { maxWidth: 420 } }}>
                        <div
                          className={className}
                          style={{
                            gridColumn: `${startCol} / ${endCol}`,
                            gridRow: row,
                            zIndex: 2,
                          }}
                        >
                          Запись
                        </div>
                      </Tooltip>
                    );
                  })}

                {(blocksByPostId.get(post.id) ?? []).map((bl) => {
                  const start = new Date(bl.startAt);
                  const end = new Date(bl.endAt);
                  const gridStart = new Date(day);
                  gridStart.setHours(computedHours.startHour, 0, 0, 0);
                  const minutesFromStart = Math.floor((start.getTime() - gridStart.getTime()) / 60000);
                  const startIndex = Math.floor(minutesFromStart / stepMinutes);
                  const span = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 60000 / stepMinutes));
                  const startCol = startIndex + 2;
                  const endCol = startCol + span;

                  const className = [
                    styles.slotBlock,
                    bl.kind === 'MANUAL_BOOKING' ? styles.slotPending : styles.slotUnavailable,
                  ].join(' ');

                  const title = (
                    <div>
                      <div>
                        <Text strong>{start.toLocaleString('ru-RU')}</Text>
                        <div>
                          <Text type="secondary">
                            До: {end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Tag>{bl.kind === 'MANUAL_BOOKING' ? 'Ручная запись' : 'Блокировка'}</Tag>
                        {bl.service?.name && (
                          <div>
                            <Text type="secondary">{bl.service.name}</Text>
                          </div>
                        )}
                        {(bl.carBrand || bl.carModel) && (
                          <div>
                            <Text type="secondary">
                              {bl.carBrand ?? ''} {bl.carModel ?? ''}
                            </Text>
                          </div>
                        )}
                        {bl.note && (
                          <div>
                            <Text type="secondary">{bl.note}</Text>
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  const content = (
                    <div>
                      {title}
                      {onDeleteBlock && (
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                          <Popconfirm
                            title="Удалить блокировку?"
                            okText="Удалить"
                            cancelText="Отмена"
                            onConfirm={() => onDeleteBlock(bl.id)}
                          >
                            <Button danger size="small">
                              Удалить
                            </Button>
                          </Popconfirm>
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <Popover key={bl.id} content={content} trigger="click" placement="topLeft">
                      <div
                        className={className}
                        style={{
                          gridColumn: `${startCol} / ${endCol}`,
                          gridRow: row,
                          zIndex: 2,
                          cursor: onDeleteBlock ? 'pointer' : undefined,
                        }}
                      >
                        {bl.kind === 'MANUAL_BOOKING' ? 'Ручная запись' : 'Блокировка'}
                      </div>
                    </Popover>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Timeline;


