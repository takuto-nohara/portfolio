const dependencyCruiserConfig = {
  forbidden: [
    {
      name: "no-domain-deps",
      comment: "domain layer must not depend on outer layers",
      severity: "error",
      from: { path: "^src/app/domain" },
      to: { path: "^src/app/(application|infrastructure|presentation)" },
    },
    {
      name: "application-only-domain-publicApi",
      comment: "application depends only on domain publicApi",
      severity: "error",
      from: { path: "^src/app/application" },
      to: { path: "^src/app/(infrastructure|presentation|domain/(?!publicApi\.ts$))" },
    },
    {
      name: "infrastructure-only-domain-publicApi",
      comment: "infrastructure depends only on domain/application public APIs",
      severity: "error",
      from: { path: "^src/app/infrastructure" },
      to: { path: "^src/app/(presentation|application/(?!publicApi\.ts$)|domain/(?!publicApi\.ts$))" },
    },
    {
      name: "presentation-only-application-publicApi",
      comment: "presentation depends only on application publicApi",
      severity: "error",
      from: { path: "^src/app/presentation" },
      to: { path: "^src/app/(domain|infrastructure|application/(?!publicApi\.ts$))" },
    },
    {
      name: "no-circular",
      comment: "forbid circular dependencies",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    tsConfig: {
      fileName: "./tsconfig.json",
    },
    doNotFollow: {
      path: "node_modules",
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
    },
  },
};

export default dependencyCruiserConfig;