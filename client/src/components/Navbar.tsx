import Link from 'next/link';
import { BookOpenIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Books', href: '/books', icon: BookOpenIcon },
  { name: 'Strategies', href: '/strategies', icon: DocumentTextIcon },
  { name: 'Stock Analysis', href: '/analysis', icon: ChartBarIcon },
];

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Investment Strategy Engine</h1>
          <div className="flex space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <item.icon className="h-5 w-5 mr-1" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 