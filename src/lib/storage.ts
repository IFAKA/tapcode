import { openDB, DBSchema, IDBPDatabase } from 'idb'

export interface ProjectFile {
  id: string
  projectId: string
  path: string
  content: string
  language: string
  createdAt: number
  updatedAt: number
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

interface TapCodeDB extends DBSchema {
  projects: {
    key: string
    value: Project
    indexes: { 'by-updated': number }
  }
  files: {
    key: string
    value: ProjectFile
    indexes: { 'by-project': string }
  }
}

let db: IDBPDatabase<TapCodeDB> | null = null

async function getDB(): Promise<IDBPDatabase<TapCodeDB>> {
  if (db) return db

  db = await openDB<TapCodeDB>('tapcode', 1, {
    upgrade(database) {
      const projectStore = database.createObjectStore('projects', { keyPath: 'id' })
      projectStore.createIndex('by-updated', 'updatedAt')

      const fileStore = database.createObjectStore('files', { keyPath: 'id' })
      fileStore.createIndex('by-project', 'projectId')
    },
  })

  return db
}

// Projects
export async function createProject(name: string): Promise<Project> {
  const database = await getDB()
  const now = Date.now()
  const project: Project = {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
  }
  await database.put('projects', project)

  // Create default index.html file
  await createFile(project.id, 'index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello ${name}</h1>
  <script src="script.js"></script>
</body>
</html>`)

  await createFile(project.id, 'style.css', `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  padding: 2rem;
}

h1 {
  color: #333;
}`)

  await createFile(project.id, 'script.js', `console.log('Hello from ${name}!')`)

  return project
}

export async function getProjects(): Promise<Project[]> {
  const database = await getDB()
  const projects = await database.getAllFromIndex('projects', 'by-updated')
  return projects.reverse()
}

export async function getProject(id: string): Promise<Project | undefined> {
  const database = await getDB()
  return database.get('projects', id)
}

export async function deleteProject(id: string): Promise<void> {
  const database = await getDB()
  const files = await getProjectFiles(id)
  for (const file of files) {
    await database.delete('files', file.id)
  }
  await database.delete('projects', id)
}

// Files
function getLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    html: 'html',
    css: 'css',
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    json: 'json',
    md: 'markdown',
  }
  return langMap[ext || ''] || 'plaintext'
}

export async function createFile(
  projectId: string,
  path: string,
  content: string = ''
): Promise<ProjectFile> {
  const database = await getDB()
  const now = Date.now()
  const file: ProjectFile = {
    id: crypto.randomUUID(),
    projectId,
    path,
    content,
    language: getLanguage(path),
    createdAt: now,
    updatedAt: now,
  }
  await database.put('files', file)

  // Update project timestamp
  const project = await getProject(projectId)
  if (project) {
    project.updatedAt = now
    await database.put('projects', project)
  }

  return file
}

export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const database = await getDB()
  return database.getAllFromIndex('files', 'by-project', projectId)
}

export async function getFile(id: string): Promise<ProjectFile | undefined> {
  const database = await getDB()
  return database.get('files', id)
}

export async function updateFile(id: string, content: string): Promise<void> {
  const database = await getDB()
  const file = await database.get('files', id)
  if (file) {
    file.content = content
    file.updatedAt = Date.now()
    await database.put('files', file)
  }
}

export async function deleteFile(id: string): Promise<void> {
  const database = await getDB()
  await database.delete('files', id)
}

export async function renameFile(id: string, newPath: string): Promise<void> {
  const database = await getDB()
  const file = await database.get('files', id)
  if (file) {
    file.path = newPath
    file.language = getLanguage(newPath)
    file.updatedAt = Date.now()
    await database.put('files', file)
  }
}
