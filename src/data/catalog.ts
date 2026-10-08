/**
 * 首页展示用的真实数据目录。
 *
 * 规则：
 * - 能从数据源算出来的数字一律现场计算，不写死展示值；
 * - 无法从数据源读取、只能与源文件保持一致的常量，必须注明对应源文件；
 * - 数据文件的 `updated` 字段是**数据文件记录时间（静态）**，不是实时状态，
 *   界面上必须按静态数据标注，不得当作"刚刚更新"。
 */

import { RESOURCE_INDEX } from './resources';
import { getAtomSlugs } from './knowledge';

import salariesJson from '../../public/data/salaries.json';
import citiesJson from '../../public/data/cities.json';
import industriesJson from '../../public/data/industries.json';

export interface MajorSalary { name: string; salary: number; field: string }
export interface CityCost { name: string; monthly: number; housingPct: number; income: number }
export interface IndustryWage { code: string; name: string; nonPrivate: number; private: number }

interface SalaryFile { updated: string; source: string; count: number; nationalAvg: number; data: MajorSalary[] }
interface CityFile { updated: string; source: string; count: number; data: CityCost[] }
interface IndustryFile { updated: string; source: string; count: number; data: IndustryWage[] }

const salaryFile = salariesJson as SalaryFile;
const cityFile = citiesJson as CityFile;
const industryFile = industriesJson as IndustryFile;

/* --- 资源库与知识库：直接从数据源计算 ------------------------------------- */
export const RESOURCE_CATEGORY_COUNT = RESOURCE_INDEX.length;
export const RESOURCE_LINK_COUNT = RESOURCE_INDEX.reduce((n, c) => n + c.links.length, 0);
export const KNOWLEDGE_ATOM_COUNT = getAtomSlugs().length;

/* --- 只能与源文件保持一致的常量（源文件不在数据层，无法在构建时读取） ------ */
/** 与 `src/lib/achievement-store.ts` 的 `TOTAL_ACHIEVEMENTS` 一致 */
export const ACHIEVEMENT_COUNT = 20;
/** 与 `src/components/explore/CareerExplorer.tsx` 中 `CAREERS` 的条数一致 */
export const CAREER_ENTRY_COUNT = 79;

/* --- 公开数据文件（静态，非实时） ----------------------------------------- */
export const SALARY_SOURCE = salaryFile.source;
export const SALARY_RECORDED_AT = salaryFile.updated;
export const SALARY_SAMPLE_COUNT = salaryFile.count;
export const SALARY_NATIONAL_AVG = salaryFile.nationalAvg;
export const TOP_MAJORS: MajorSalary[] = [...salaryFile.data]
  .sort((a, b) => b.salary - a.salary)
  .slice(0, 5);
export const BOTTOM_MAJORS: MajorSalary[] = [...salaryFile.data]
  .sort((a, b) => a.salary - b.salary)
  .slice(0, 5);

export const CITY_SOURCE = cityFile.source;
export const CITY_RECORDED_AT = cityFile.updated;
export const CITY_COUNT = cityFile.count;

export const INDUSTRY_SOURCE = industryFile.source;
export const INDUSTRY_RECORDED_AT = industryFile.updated;
export const INDUSTRY_COUNT = industryFile.count;

/** 数据文件记录时间的展示格式（仅为静态标注，不代表实时更新） */
export function formatRecordedAt(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '.');
}

/** 列表之间的月度差额，用于说明"同一年毕业，起薪可以差多少" */
export const SALARY_SPREAD = TOP_MAJORS[0].salary - BOTTOM_MAJORS[0].salary;
