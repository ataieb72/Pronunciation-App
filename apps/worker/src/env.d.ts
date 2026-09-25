// Bindings and project-wide type hints for the Worker.
declare namespace Cloudflare {
  interface GlobalProps {
    mainModule: typeof import('./index');
  }
}
