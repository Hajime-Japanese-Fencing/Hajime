import { describe, it, expect } from 'vitest'

import {factorial} from "./statistics.service.ts";

describe('factorial', () => {
    it('returns 1 for 1', () => {

        expect(factorial(1)).toBe(1)
    })

    it('returns 2 for 2', () => {

        expect(factorial(2)).toBe(2)
    })

    it('returns 3628800 for 10', () => {

        expect(factorial(10)).toBe(3628800)
    })

    it('returns 1 for 0',() => {
        expect(factorial(0)).toBe(1)
    })

    it('throws error for a negative',() => {
        expect(() => factorial(-5)).toThrow('Number must be a positive integer')
    })

    it('throws error for a decimal',() => {
        expect(() => factorial(2.3)).toThrow('Number must be a positive integer')
    })
})
