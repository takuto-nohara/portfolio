export default {
  forbidden: [
    {
      name: "no-domain-deps",
      comment: "domain layer must not depend on outer layers",
      severity: "error",
      from: { path: "^src/domain" },
      to: { path: "^src/(application|infrastructure|presentation)" },
    },
    {
      name: "application-only-domain-publicApi",
      comment: "application depends only on domain publicApi",
      severity: "error",
      from: { path: "^src/application" },
      to: { path: "^src/(infrastructure|presentation|domain/(?!publicApi\\.ts$))" },
    },
    {
      name: "infrastructure-only-domain-publicApi",
      comment: "infrastructure depends only on domain publicApi",
      severity: "error",
      from: { path: "^src/infrastructure" },
      to: { path: "^src/(application|presentation|domain/(?!publicApi\\.ts$))" },
    },
    {
      name: "presentation-only-application-publicApi",
      comment: "presentation depends only on application publicApi",
      severity: "error",
      from: { path: "^src/presentation" },
      to: { path: "^src/(domain|infrastructure|application/(?!publicApi\\.ts$))" },
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