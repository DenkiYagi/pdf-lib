module.exports = (request, options) => {
  const tryResolve = (specifier) => {
    try {
      return options.defaultResolver(specifier, options);
    } catch {
      return null;
    }
  };

  const resolved = tryResolve(request);
  if (resolved) return resolved;

  if (request.endsWith('.js')) {
    const withoutJs = request.slice(0, -3);
    return (
      tryResolve(withoutJs) ||
      tryResolve(`${withoutJs}.ts`) ||
      tryResolve(`${withoutJs}.tsx`) ||
      options.defaultResolver(request, options)
    );
  }

  return options.defaultResolver(request, options);
};
