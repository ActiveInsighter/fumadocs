import type { Route } from './+types/home';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from 'react-router';
import { baseOptions } from '@/lib/layout.shared';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '学习资料库' },
    { name: 'description', content: '数学、计算机 408 与算法学习资料。' },
  ];
}

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="p-4 flex flex-col items-center justify-center text-center flex-1">
        <h1 className="text-xl font-bold mb-2">学习资料库</h1>
        <p className="text-fd-muted-foreground mb-4">
          按主题浏览数学、计算机 408 与算法资料。
        </p>
        <Link
          className="text-sm bg-fd-primary text-fd-primary-foreground rounded-full font-medium px-4 py-2.5"
          to="/docs"
        >
          浏览文档
        </Link>
      </div>
    </HomeLayout>
  );
}

