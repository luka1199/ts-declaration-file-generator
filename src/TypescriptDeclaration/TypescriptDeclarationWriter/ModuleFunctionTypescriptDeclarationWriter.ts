import { BaseTypescriptDeclarationWriter } from './BaseTypescriptDeclarationWriter';
import { BaseModuleTypescriptDeclaration } from '../ModuleDeclaration/BaseModuleTypescriptDeclaration';

export class ModuleFunctionTypescriptDeclarationWriter extends BaseTypescriptDeclarationWriter {
    protected doWrite(typescriptModuleDeclaration: BaseModuleTypescriptDeclaration) {
        this.writeExportModule();
        this.writeFunction(typescriptModuleDeclaration);

        if (
            typescriptModuleDeclaration.interfaces.length > 0 ||
            typescriptModuleDeclaration.classes.length > 0 ||
            typescriptModuleDeclaration.methods.length > 1
        ) {
            this.openNamespace();
            this.writeInterfaces(typescriptModuleDeclaration);
            this.writeClasses(typescriptModuleDeclaration);
            this.writeFunctions(typescriptModuleDeclaration);
            this.closeNamespace();
        }
    }

    protected getExportedName(typescriptModuleDeclaration: BaseModuleTypescriptDeclaration): string {
        let n = typescriptModuleDeclaration.module.replace(/([-_][a-z])/ig, ($1: string) => {
            return $1.toUpperCase()
                .replace('-', '')
                .replace('_', '');
        });

        return n.charAt(0).toUpperCase() + n.slice(1);
    }

    private writeFunction(typescriptModuleDeclaration: BaseModuleTypescriptDeclaration): void {
        let exportedFunctionDeclarations = typescriptModuleDeclaration.methods.filter(t => (t.isExported === true));

        exportedFunctionDeclarations.forEach(exportedFunctionDeclaration => {
            exportedFunctionDeclaration.name = this.exportNamespace;
    
            this.fileContents += "declare function " + this.getFunctionNameWithTypes(exportedFunctionDeclaration) + ";\n";
        })
    }

    private writeFunctions(typescriptModuleDeclaration: BaseModuleTypescriptDeclaration): void {
        typescriptModuleDeclaration.methods.filter(t => (t.isExported !== true)).forEach(innerNotExportedFunction => {
            this.fileContents += "\texport function " + this.getFunctionNameWithTypes(innerNotExportedFunction) + ";\n"
        });
    }

    private writeInterfaces(typescriptModuleDeclaration: BaseModuleTypescriptDeclaration): void {
        typescriptModuleDeclaration.interfaces.forEach(i => {
            this.fileContents += "\texport interface " + i.name + " {\n";

            i.getAttributes().forEach(a => {
                this.fileContents += `\t\t${this.buildInterfaceAttribute(a)};\n`;
            });

            i.methods.forEach(m => {
                this.fileContents += "\t\t" + this.getFunctionNameWithTypes(m) + ";\n";
            });

            this.fileContents += "\t}\n\n";
        });
    }

    private writeClasses(typescriptModuleDeclaration: BaseModuleTypescriptDeclaration): void {
        typescriptModuleDeclaration.classes.forEach(classDeclaration => {
            this.fileContents += "\texport class " + classDeclaration.name + " {\n";

            this.fileContents += "\t\t" + this.getConstructorSignature(classDeclaration.constructorMethod) + ";\n";

            classDeclaration.getMethods().forEach(m => {
                this.fileContents += "\t\t" + this.getFunctionNameWithTypes(m) + ";\n";
            });

            this.fileContents += "\t}\n\n";
        });
    }
}