export function primerError(errores: readonly unknown[]): string | undefined {
    return errores.find((error): error is string => typeof error ==="string");
}