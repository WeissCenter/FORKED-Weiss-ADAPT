import { RenderMode, ServerRoute } from '@angular/ssr';

// renderMode: RenderMode.Client - browser renders the page
//RenderMode.Prerender - for static pages, all the information needed to build/comple the page must exists at build time
//RenderMode.Server - server renders the page
export const serverRoutes: ServerRoute[] = [
  //{ path: "**", renderMode: RenderMode.Server },
  { path: '', renderMode: RenderMode.Server, },
  { path: 'share/:slug', renderMode: RenderMode.Server, },
  { path: 'reports', renderMode: RenderMode.Server  },
  { path: 'resources', renderMode: RenderMode.Server },
  { path: '404', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client }
];




