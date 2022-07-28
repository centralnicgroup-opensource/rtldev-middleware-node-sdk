import { ResponseTemplate } from "./responsetemplate.js";
export declare class ResponseTemplateManager {
    static getInstance(): ResponseTemplateManager;
    private static instance;
    private templates;
    private constructor();
    generateTemplate(code: string, description: string): string;
    addTemplate(id: string, plain: string): ResponseTemplateManager;
    getTemplate(id: string): ResponseTemplate;
    getTemplates(): any;
    hasTemplate(id: string): boolean;
    isTemplateMatchHash(tpl2: any, id: string): boolean;
    isTemplateMatchPlain(plain: string, id: string): boolean;
}
//# sourceMappingURL=responsetemplatemanager.d.ts.map