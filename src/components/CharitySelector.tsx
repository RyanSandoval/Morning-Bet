'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Check, Building, ChevronDown, X } from 'lucide-react';
import type { Charity } from '@/types';

const CATEGORY_LABELS: Record<Charity['category'], string> = {
  political_left: 'Political (Left)',
  political_right: 'Political (Right)',
  environmental: 'Environmental',
  sports: 'Sports Teams',
  social: 'Social Causes',
  religious: 'Religious',
  other: 'Other',
};

const CATEGORY_COLORS: Record<Charity['category'], string> = {
  political_left: 'bg-blue-100 text-blue-800',
  political_right: 'bg-red-100 text-red-800',
  environmental: 'bg-green-100 text-green-800',
  sports: 'bg-orange-100 text-orange-800',
  social: 'bg-purple-100 text-purple-800',
  religious: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
};

interface CharitySelectorProps {
  value: Charity | null;
  onChange: (charity: Charity | null) => void;
  className?: string;
}

export default function CharitySelector({ value, onChange, className }: CharitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Charity['category'] | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch charities
  useEffect(() => {
    async function fetchCharities() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) {
          params.set('search', search);
        } else if (selectedCategory !== 'all') {
          params.set('category', selectedCategory);
        }
        params.set('controversial', 'true'); // Show controversial charities for "charities you hate"

        const response = await fetch(`/api/charities?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setCharities(data.charities || []);
        }
      } catch (error) {
        console.error('Failed to fetch charities:', error);
      } finally {
        setLoading(false);
      }
    }

    const debounceTimer = setTimeout(fetchCharities, search ? 300 : 0);
    return () => clearTimeout(debounceTimer);
  }, [search, selectedCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (charity: Charity) => {
    onChange(charity);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null);
    setSearch('');
  };

  const categories: Array<Charity['category'] | 'all'> = [
    'all',
    'political_left',
    'political_right',
    'sports',
    'environmental',
    'social',
    'religious',
    'other',
  ];

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Selected Value Display / Search Input */}
      <div
        className={cn(
          'flex items-center gap-2 w-full rounded-lg border bg-background px-3 py-2 cursor-pointer transition-colors',
          isOpen ? 'border-primary ring-1 ring-primary' : 'border-input hover:border-primary/50'
        )}
        onClick={() => setIsOpen(true)}
      >
        {value ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{value.name}</span>
              <Badge className={cn('text-xs', CATEGORY_COLORS[value.category])}>
                {CATEGORY_LABELS[value.category]}
              </Badge>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full text-muted-foreground">
            <Search className="w-4 h-4" />
            <span>Select a charity you hate...</span>
            <ChevronDown className="w-4 h-4 ml-auto" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search charities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="p-2 border-b flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearch('');
                }}
                className={cn(
                  'px-2 py-1 text-xs rounded-full transition-colors',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Charity List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading charities...
              </div>
            ) : charities.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No charities found
              </div>
            ) : (
              charities.map((charity) => (
                <button
                  key={charity.id}
                  onClick={() => handleSelect(charity)}
                  className={cn(
                    'w-full p-3 text-left hover:bg-muted transition-colors flex items-start gap-3',
                    value?.id === charity.id && 'bg-primary/10'
                  )}
                >
                  <Building className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{charity.name}</span>
                      {value?.id === charity.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {charity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn('text-xs', CATEGORY_COLORS[charity.category])}>
                        {CATEGORY_LABELS[charity.category]}
                      </Badge>
                      {charity.is_controversial && (
                        <Badge variant="outline" className="text-xs">
                          Controversial
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground text-center">
            Pick something that will REALLY motivate you to complete your tasks!
          </div>
        </div>
      )}
    </div>
  );
}
