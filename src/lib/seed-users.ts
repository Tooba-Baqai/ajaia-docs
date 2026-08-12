export interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  initials: string;
  color: string;
  bio: string;
}

export const SEEDED_USERS: SeedUser[] = [
  {
    id: 'user_tooba',
    name: 'Tooba Baqai',
    email: 'toobabaqai1@gmail.com',
    role: 'Candidate / Product Engineer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tooba&backgroundColor=b6e3f4',
    initials: 'TB',
    color: '#0e8fe5',
    bio: 'Candidate for AI-Native Full Stack Product Engineer at Ajaia',
  },
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    email: 'alex@ajaia.io',
    role: 'Engineering Lead',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=ffd5dc',
    initials: 'AR',
    color: '#8b5cf6',
    bio: 'Tech Lead managing core productivity tools & document pipelines',
  },
  {
    id: 'user_jordan',
    name: 'Jordan Lee',
    email: 'jordan@ajaia.io',
    role: 'Product Designer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=c0aede',
    initials: 'JL',
    color: '#10b981',
    bio: 'Lead UX/UI Designer focusing on collaboration flows',
  },
  {
    id: 'user_sam',
    name: 'Sam Taylor',
    email: 'sam@ajaia.io',
    role: 'Security & QA Reviewer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=d1d4f9',
    initials: 'ST',
    color: '#f59e0b',
    bio: 'Reviewer evaluating access boundary enforcement and audit trails',
  },
];

export const DEFAULT_USER = SEEDED_USERS[0];
