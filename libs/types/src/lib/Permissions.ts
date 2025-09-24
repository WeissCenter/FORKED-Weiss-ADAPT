import { iam } from '@pulumi/aws/types/input';

// List the roles that are available in the application
export type AppRole = string;

// const roles = ['Reader', 'Editor', 'Manager', 'Admin'] as const;
// export type AppRole = typeof roles[number];

// List the objects that can be accessed in the application
export type PermissionObject =
  | 'Data Sources'
  | 'Data Views'
  | 'Report Templates'
  | 'Reports'
  | 'Glossary'
  | 'Users'
  | 'Tool Settings';

// List the actions that can be performed on the objects
export type PermissionAction = 'Read' | 'Write' | 'Approve';

type AllAppPermissions = {
  [key in PermissionObject]: PermissionAction[];
};

export type AppPermissions = Partial<AllAppPermissions>;

export type PermissionMatrix = {
  [key in PermissionObject]?: {
    [key in PermissionAction]?: iam.GetPolicyDocumentStatement[];
  };
};

export type AppRolePermissions = {
  [key in AppRole]: AppRolePermission;
};

export type AppRolePermission = {
  description: string;
  permissions: AppPermissions;
};

// Define the permissions for each role
export const appRolePermissions: AppRolePermissions = {
  Reader: {
    description: 'ADAPT Reader',
    permissions: {
      'Data Sources': [],
      'Data Views': ['Read'],
      'Report Templates': ['Read'],
      Reports: ['Read'],
      Glossary: ['Read'],
      'Tool Settings': [],
    },
  },
  Editor: {
    description: 'ADAPT Editor',
    permissions: {
      'Data Sources': [],
      'Data Views': ['Read', 'Write'],
      'Report Templates': ['Read', 'Write'],
      Reports: ['Read', 'Write'],
      Glossary: ['Read', 'Write'],
      'Tool Settings': [],
    },
  },
  Manager: {
    description: 'ADAPT Manager',
    permissions: {
      'Data Sources': ['Read', 'Write'],
      'Data Views': ['Read', 'Write'],
      'Report Templates': ['Read', 'Write'],
      Reports: ['Read', 'Write', 'Approve'],
      Glossary: ['Read', 'Write', 'Approve'],
      Users: ['Read'],
      'Tool Settings': ['Read', 'Write'],
    },
  },
  Admin: {
    description: 'ADAPT Admin',
    permissions: {
      'Data Sources': ['Read', 'Write'],
      'Data Views': ['Read', 'Write'],
      'Report Templates': ['Read', 'Write'],
      Reports: ['Read'],
      Glossary: ['Read', 'Write'],
      Users: ['Read', 'Write'],
      'Tool Settings': ['Read', 'Write'],
    },
  },
  SuperAdmin: {
    description: 'ADAPT Super Admin',
    permissions: {
      'Data Sources': ['Read', 'Write'],
      'Data Views': ['Read', 'Write'],
      'Report Templates': ['Read', 'Write'],
      Reports: ['Read', 'Write', 'Approve'],
      Glossary: ['Read', 'Write', 'Approve'],
      Users: ['Read', 'Write'],
      'Tool Settings': ['Read', 'Write'],
    },
  },
};
