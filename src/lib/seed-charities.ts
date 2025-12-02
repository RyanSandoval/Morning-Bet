import type { Charity } from '@/types';

// Seed data for charities - curated list of organizations across the political spectrum
// Note: stripe_connect_account_id should be set up via Stripe Connect dashboard in production
export const SEED_CHARITIES: Omit<Charity, 'id' | 'created_at'>[] = [
  // Political - Left leaning
  {
    name: 'Planned Parenthood',
    description: 'Reproductive health care organization providing services including birth control, STI testing, and abortion care.',
    category: 'political_left',
    logo_url: null,
    website_url: 'https://www.plannedparenthood.org',
    ein: '13-1644147',
    stripe_connect_account_id: null, // Set via Stripe Connect
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'ACLU',
    description: 'American Civil Liberties Union - defends individual rights and liberties guaranteed by the Constitution.',
    category: 'political_left',
    logo_url: null,
    website_url: 'https://www.aclu.org',
    ein: '13-6213516',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'Human Rights Campaign',
    description: 'LGBTQ+ civil rights advocacy organization and political lobbying group.',
    category: 'political_left',
    logo_url: null,
    website_url: 'https://www.hrc.org',
    ein: '52-1481896',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },

  // Political - Right leaning
  {
    name: 'NRA Foundation',
    description: 'National Rifle Association educational foundation supporting firearms safety and marksmanship programs.',
    category: 'political_right',
    logo_url: null,
    website_url: 'https://www.nrafoundation.org',
    ein: '52-1710886',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'Heritage Foundation',
    description: 'Conservative think tank promoting free enterprise, limited government, and traditional values.',
    category: 'political_right',
    logo_url: null,
    website_url: 'https://www.heritage.org',
    ein: '23-7327730',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'Turning Point USA',
    description: 'Conservative nonprofit promoting principles of freedom, free markets, and limited government on campuses.',
    category: 'political_right',
    logo_url: null,
    website_url: 'https://www.tpusa.com',
    ein: '80-0948168',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },

  // Environmental
  {
    name: 'Sierra Club Foundation',
    description: 'Environmental organization focused on conservation and climate advocacy.',
    category: 'environmental',
    logo_url: null,
    website_url: 'https://www.sierraclub.org',
    ein: '94-6069890',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: false,
  },
  {
    name: 'American Petroleum Institute',
    description: 'National trade association representing the oil and natural gas industry.',
    category: 'environmental',
    logo_url: null,
    website_url: 'https://www.api.org',
    ein: '13-0433430',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },

  // Sports - Rival team foundations
  {
    name: 'New York Yankees Foundation',
    description: 'Charitable arm of the New York Yankees baseball team.',
    category: 'sports',
    logo_url: null,
    website_url: 'https://www.mlb.com/yankees/community/foundation',
    ein: '13-3964603',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'Boston Red Sox Foundation',
    description: 'Charitable foundation of the Boston Red Sox baseball team.',
    category: 'sports',
    logo_url: null,
    website_url: 'https://www.mlb.com/redsox/community/foundation',
    ein: '04-3558003',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'Dallas Cowboys Foundation',
    description: 'Charitable arm of the Dallas Cowboys football team.',
    category: 'sports',
    logo_url: null,
    website_url: 'https://www.dallascowboys.com/community',
    ein: '75-2745089',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'Philadelphia Eagles Foundation',
    description: 'Charitable foundation of the Philadelphia Eagles football team.',
    category: 'sports',
    logo_url: null,
    website_url: 'https://www.philadelphiaeagles.com/community',
    ein: '23-2944915',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },

  // Social causes
  {
    name: 'PETA',
    description: 'People for the Ethical Treatment of Animals - animal rights organization.',
    category: 'social',
    logo_url: null,
    website_url: 'https://www.peta.org',
    ein: '52-1218336',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'Salvation Army',
    description: 'International charitable organization providing social services and disaster relief.',
    category: 'social',
    logo_url: null,
    website_url: 'https://www.salvationarmyusa.org',
    ein: '58-0660607',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: false,
  },

  // Religious
  {
    name: 'Focus on the Family',
    description: 'Christian conservative organization promoting traditional family values.',
    category: 'religious',
    logo_url: null,
    website_url: 'https://www.focusonthefamily.com',
    ein: '84-0694733',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'Freedom From Religion Foundation',
    description: 'Nonprofit promoting separation of church and state and advocating for nontheists.',
    category: 'religious',
    logo_url: null,
    website_url: 'https://ffrf.org',
    ein: '39-1302520',
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },

  // Other - unconventional choices for maximum motivation
  {
    name: 'Flat Earth Society',
    description: 'Organization promoting the belief that the Earth is flat.',
    category: 'other',
    logo_url: null,
    website_url: 'https://www.tfes.org',
    ein: null, // Not a registered 501(c)(3)
    stripe_connect_account_id: null,
    is_active: true,
    is_controversial: true,
  },
  {
    name: 'Your Ex\'s Favorite Charity',
    description: 'A placeholder - choose any charity your ex would love.',
    category: 'other',
    logo_url: null,
    website_url: null,
    ein: null,
    stripe_connect_account_id: null,
    is_active: false, // Not actually active, just for UI suggestion
    is_controversial: true,
  },
];

export function getSeedCharities() {
  return SEED_CHARITIES.filter(c => c.is_active);
}
