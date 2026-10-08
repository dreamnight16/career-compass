'use client';

import { useSearchParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ResourceBrowser } from '@/components/chat/ResourceBrowser';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { RouteBoard } from '@/components/routes/RouteBoard';
import { DataCenter } from '@/components/explore/DataCenter';
import { DecisionTree } from '@/components/explore/DecisionTree';
import { CareerExplorer } from '@/components/explore/CareerExplorer';
import { DecisionJournal } from '@/components/decisions/DecisionJournal';

/**
 * 所有模块同时挂载，通过 display 切换，避免切换时丢失状态。
 * `?tab=` 取值与导航信息架构一一对应，未知取值回落到 `coach`。
 */
const TABS = ['coach', 'profile', 'resources', 'routes', 'journal', 'explore', 'sim', 'careers'] as const;

export function ContentRouter() {
  const params = useSearchParams();
  const raw = params.get('tab') || 'coach';
  const tab = (TABS as readonly string[]).includes(raw) ? raw : 'coach';

  return (
    <div id="cc-main" className="flex-1 overflow-hidden pb-16 lg:pb-0">
      <div className={tab === 'coach' ? 'h-full' : 'hidden'}>
        <ChatInterface />
      </div>
      <div className={tab === 'profile' ? 'h-full' : 'hidden'}>
        <ProfileDashboard />
      </div>
      <div className={tab === 'resources' ? 'h-full' : 'hidden'}>
        <ResourceBrowser />
      </div>
      <div className={tab === 'routes' ? 'h-full overflow-auto' : 'hidden'}>
        <RouteBoard />
      </div>
      <div className={tab === 'journal' ? 'h-full' : 'hidden'}>
        <DecisionJournal />
      </div>
      <div className={tab === 'explore' ? 'h-full' : 'hidden'}>
        <DataCenter />
      </div>
      <div className={tab === 'sim' ? 'h-full' : 'hidden'}>
        <DecisionTree />
      </div>
      <div className={tab === 'careers' ? 'h-full' : 'hidden'}>
        <CareerExplorer />
      </div>
    </div>
  );
}
