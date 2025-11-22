// lib/logger.ts
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { homedir } from "os"

export class Logger {
    private logDir: string
    public enabled: boolean
    private fileCounter: number = 0 // Counter to prevent filename collisions

    constructor(enabled: boolean) {
        this.enabled = enabled
        // Always save logs to ~/.config/opencode/logs/dcp/ regardless of installation method
        // This ensures users can find logs in a consistent location
        const opencodeConfigDir = join(homedir(), ".config", "opencode")
        this.logDir = join(opencodeConfigDir, "logs", "dcp")
    }

    private async ensureLogDir() {
        if (!existsSync(this.logDir)) {
            await mkdir(this.logDir, { recursive: true })
        }
    }

    private async write(level: string, component: string, message: string, data?: any) {
        if (!this.enabled) return

        try {
            await this.ensureLogDir()

            const timestamp = new Date().toISOString()
            const logEntry = {
                timestamp,
                level,
                component,
                message,
                ...(data && { data })
            }

            const dailyLogDir = join(this.logDir, "daily")
            if (!existsSync(dailyLogDir)) {
                await mkdir(dailyLogDir, { recursive: true })
            }

            const logFile = join(dailyLogDir, `${new Date().toISOString().split('T')[0]}.log`)
            const logLine = JSON.stringify(logEntry) + "\n"

            await writeFile(logFile, logLine, { flag: "a" })
        } catch (error) {
            // Silently fail - don't break the plugin if logging fails
        }
    }

    info(component: string, message: string, data?: any) {
        return this.write("INFO", component, message, data)
    }

    debug(component: string, message: string, data?: any) {
        return this.write("DEBUG", component, message, data)
    }

    warn(component: string, message: string, data?: any) {
        return this.write("WARN", component, message, data)
    }

    error(component: string, message: string, data?: any) {
        return this.write("ERROR", component, message, data)
    }

    /**
     * Saves AI context to a dedicated directory for debugging
     * Each call creates a new timestamped file in ~/.config/opencode/logs/dcp/ai-context/
     * Only writes if debug is enabled
     */
    async saveWrappedContext(sessionID: string, messages: any[], metadata: any) {
        if (!this.enabled) return

        try {
            await this.ensureLogDir()
            
            const aiContextDir = join(this.logDir, "ai-context")
            if (!existsSync(aiContextDir)) {
                await mkdir(aiContextDir, { recursive: true })
            }

            const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-')
            // Add counter to prevent filename collisions when multiple requests happen in same millisecond
            const counter = (this.fileCounter++).toString().padStart(3, '0')
            const filename = `${timestamp}_${counter}_${sessionID.substring(0, 15)}.json`
            const filepath = join(aiContextDir, filename)

            const content = {
                timestamp: new Date().toISOString(),
                sessionID,
                metadata,
                messages
            }

            await writeFile(filepath, JSON.stringify(content, null, 2))
            
            // Log that we saved it
            await this.debug("logger", "Saved AI context", {
                sessionID,
                filepath,
                messageCount: messages.length
            })
        } catch (error) {
            // Silently fail - don't break the plugin if logging fails
        }
    }
}
