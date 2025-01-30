/* eslint-disable no-console */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

// Saves algorithm data to artefacts/algorithm-name.json
export async function saveArtefact(data: unknown, ...path: string[]) {
  const dir = join(cwd(), 'artefacts', ...path.slice(0, -1))
  const filepath = join(dir, `${path.at(-1)}.json`)

  try {
    await mkdir(dir, { recursive: true })
    await writeFile(filepath, JSON.stringify(data, null, 2), { encoding: 'utf-8', flag: 'w' })
    console.log('Saving to:', filepath)
  }

  catch (error) {
    console.error('Error saving file:', error)
  }
}
