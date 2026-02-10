import { cache } from 'react';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

interface FetchOptions extends RequestInit {
  revalidate?: number;
  tags?: string[];
}

/**
 * Server-side API fetch utility with caching
 * Uses React cache() for deduplication and Next.js revalidation options
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const { revalidate, tags, ...fetchOptions } = options || {};

  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    next: {
      revalidate: revalidate,
      tags: tags,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null as T;
    }
    const error = await res.json().catch(() => ({
      message: 'Failed to fetch data',
    }));
    throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// Lists
export const getLists = cache(
  async (filters?: Record<string, string | number>) => {
    const params = new URLSearchParams(
      filters as Record<string, string>
    ).toString();
    return fetchAPI(`/lists${params ? `?${params}` : ''}`, {
      revalidate: 60, // Revalidate every 60 seconds
      tags: ['lists'],
    });
  }
);

export const getList = cache(async (id: string, include?: string) => {
  const params = new URLSearchParams();
  if (include) params.set('include', include);
  const queryString = params.toString();

  return fetchAPI(`/lists/${id}${queryString ? `?${queryString}` : ''}`, {
    tags: [`list-${id}`], // For on-demand revalidation
  });
});

// Items
export const getListItems = cache(async (listId: string) => {
  return fetchAPI(`/lists/${listId}/items`, {
    tags: [`list-${listId}-items`],
  });
});

export const getListItem = cache(async (listId: string, itemId: string) => {
  return fetchAPI(`/lists/${listId}/items/${itemId}`, {
    tags: [`item-${itemId}`],
  });
});

// Categories
export const getCategories = cache(
  async (filters?: Record<string, string | number>) => {
    const params = new URLSearchParams(
      filters as Record<string, string>
    ).toString();
    return fetchAPI(`/categories${params ? `?${params}` : ''}`, {
      revalidate: 300, // Revalidate every 5 minutes (categories change less often)
      tags: ['categories'],
    });
  }
);

export const getCategory = cache(async (id: string) => {
  return fetchAPI(`/categories/${id}`, {
    tags: [`category-${id}`],
  });
});

// Users
export const getCurrentUser = cache(async () => {
  return fetchAPI('/users/me', {
    revalidate: 0, // No caching for current user
    tags: ['current-user'],
  });
});

export const getUserPreferences = cache(async () => {
  return fetchAPI('/users/me/preferences', {
    revalidate: 60,
    tags: ['user-preferences'],
  });
});
