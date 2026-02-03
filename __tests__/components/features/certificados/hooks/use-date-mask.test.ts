import { renderHook, act } from '@testing-library/react'
import { useDateMask, maskDate, dateToISO, formatDateToDisplay } from '@/components/features/certificados/hooks/use-date-mask'

describe('useDateMask - Helper Functions', () => {
    describe('maskDate', () => {
        it('should format empty string', () => {
            expect(maskDate('')).toBe('')
        })

        it('should format single digit', () => {
            expect(maskDate('1')).toBe('1')
        })

        it('should format day (2 digits)', () => {
            expect(maskDate('12')).toBe('12')
        })

        it('should add first slash after day', () => {
            expect(maskDate('123')).toBe('12/3')
        })

        it('should format day and month', () => {
            expect(maskDate('1234')).toBe('12/34')
        })

        it('should add second slash after month', () => {
            expect(maskDate('12345')).toBe('12/34/5')
        })

        it('should format complete date', () => {
            expect(maskDate('12342024')).toBe('12/34/2024')
        })

        it('should limit to 10 characters (DD/MM/YYYY)', () => {
            expect(maskDate('123420241234')).toBe('12/34/2024')
        })

        it('should remove non-numeric characters', () => {
            expect(maskDate('12abc34xyz2024')).toBe('12/34/2024')
        })

        it('should handle mixed input with special characters', () => {
            expect(maskDate('1@2#3$4%2^0&2*4')).toBe('12/34/2024')
        })

        it('should handle already formatted input', () => {
            expect(maskDate('12/34/2024')).toBe('12/34/2024')
        })
    })

    describe('dateToISO', () => {
        it('should convert DD/MM/YYYY to YYYY-MM-DD', () => {
            expect(dateToISO('15/03/2024')).toBe('2024-03-15')
        })

        it('should handle single digit day and month', () => {
            expect(dateToISO('01/01/2024')).toBe('2024-01-01')
        })

        it('should return empty string for invalid format', () => {
            expect(dateToISO('')).toBe('')
            expect(dateToISO('invalid')).toBe('')
            expect(dateToISO('12/34')).toBe('')
        })

        it('should handle dates with leading zeros', () => {
            expect(dateToISO('01/01/2024')).toBe('2024-01-01')
            expect(dateToISO('09/09/2024')).toBe('2024-09-09')
        })

        it('should handle end of month dates', () => {
            expect(dateToISO('31/12/2024')).toBe('2024-12-31')
            expect(dateToISO('28/02/2024')).toBe('2024-02-28')
        })
    })

    describe('formatDateToDisplay', () => {
        it('should convert YYYY-MM-DD to DD/MM/YYYY', () => {
            expect(formatDateToDisplay('2024-03-15')).toBe('15/03/2024')
        })

        it('should handle empty string', () => {
            expect(formatDateToDisplay('')).toBe('')
        })

        it('should handle invalid ISO date by returning as-is', () => {
            // Function returns input if it doesn't match ISO format
            expect(formatDateToDisplay('invalid')).toBe('invalid')
        })

        it('should handle dates with single digits', () => {
            expect(formatDateToDisplay('2024-01-01')).toBe('01/01/2024')
            expect(formatDateToDisplay('2024-09-09')).toBe('09/09/2024')
        })

        it('should handle already formatted DD/MM/YYYY', () => {
            // Se já estiver no formato DD/MM/YYYY, deve retornar como está
            expect(formatDateToDisplay('15/03/2024')).toBe('15/03/2024')
        })
    })
})

describe('useDateMask - Hook', () => {
    describe('handleDateChange', () => {
        it('should update form data with masked date for incomplete input', () => {
            const { result } = renderHook(() => useDateMask())
            const mockSetFormData = jest.fn()

            act(() => {
                result.current.handleDateChange('1234', 'dataInicio', mockSetFormData)
            })

            // Incomplete date should store masked version
            expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function))

            // Verify callback behavior
            const callback = mockSetFormData.mock.calls[0][0]
            const prevState = { dataInicio: '', dataFim: '' }
            const newState = callback(prevState)
            expect(newState.dataInicio).toBe('12/34')
        })

        it('should convert valid complete date to ISO format', () => {
            const { result } = renderHook(() => useDateMask())
            const mockSetFormData = jest.fn()

            act(() => {
                result.current.handleDateChange('15032024', 'dataInicio', mockSetFormData)
            })

            expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function))

            const callback = mockSetFormData.mock.calls[0][0]
            const prevState = { dataInicio: '', dataFim: '' }
            const newState = callback(prevState)

            // Valid complete date should be stored as ISO
            expect(newState.dataInicio).toBe('2024-03-15')
        })

        it('should handle invalid complete date gracefully', () => {
            const { result } = renderHook(() => useDateMask())
            const mockSetFormData = jest.fn()

            act(() => {
                result.current.handleDateChange('99999999', 'dataInicio', mockSetFormData)
            })

            expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function))

            const callback = mockSetFormData.mock.calls[0][0]
            const prevState = { dataInicio: '', dataFim: '' }
            const newState = callback(prevState)

            // Invalid date should still be masked but not converted to ISO
            expect(newState.dataInicio).toBe('99/99/9999')
        })

        it('should work with different field names', () => {
            const { result } = renderHook(() => useDateMask())
            const mockSetFormData = jest.fn()

            act(() => {
                result.current.handleDateChange('01012024', 'dataFim', mockSetFormData)
            })

            const callback = mockSetFormData.mock.calls[0][0]
            const prevState = { dataInicio: '', dataFim: '' }
            const newState = callback(prevState)

            expect(newState.dataFim).toBe('2024-01-01')
        })

        it('should preserve other fields when updating', () => {
            const { result } = renderHook(() => useDateMask())
            const mockSetFormData = jest.fn()

            act(() => {
                result.current.handleDateChange('15032024', 'dataInicio', mockSetFormData)
            })

            const callback = mockSetFormData.mock.calls[0][0]
            const prevState = {
                titulo: 'Test Course',
                dataInicio: '',
                dataFim: '2024-05-01',
                instituicao: 'UFBA'
            }
            const newState = callback(prevState)

            expect(newState.titulo).toBe('Test Course')
            expect(newState.dataFim).toBe('2024-05-01')
            expect(newState.instituicao).toBe('UFBA')
            expect(newState.dataInicio).toBe('2024-03-15')
        })

        it('should handle rapid successive inputs (like user typing)', () => {
            const { result } = renderHook(() => useDateMask())
            const mockSetFormData = jest.fn()

            // Simulate user typing one character at a time
            const inputs = ['1', '15', '150', '1503', '15032', '150320', '1503202', '15032024']

            inputs.forEach(input => {
                act(() => {
                    result.current.handleDateChange(input, 'dataInicio', mockSetFormData)
                })
            })

            // Last call should have converted to ISO
            const lastCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0]
            const prevState = { dataInicio: '' }
            const finalState = lastCall(prevState)

            expect(finalState.dataInicio).toBe('2024-03-15')
        })

        it('should be memoized and return stable reference', () => {
            const { result, rerender } = renderHook(() => useDateMask())
            const firstHandleDateChange = result.current.handleDateChange

            rerender()
            const secondHandleDateChange = result.current.handleDateChange

            expect(firstHandleDateChange).toBe(secondHandleDateChange)
        })
    })

    describe('exported functions', () => {
        it('should export all utility functions', () => {
            const { result } = renderHook(() => useDateMask())

            expect(result.current.maskDate).toBe(maskDate)
            expect(result.current.dateToISO).toBe(dateToISO)
            expect(result.current.formatDateToDisplay).toBe(formatDateToDisplay)
            expect(typeof result.current.handleDateChange).toBe('function')
        })
    })
})

describe('useDateMask - Edge Cases', () => {
    it('should handle leap year dates correctly', () => {
        expect(dateToISO('29/02/2024')).toBe('2024-02-29')
        expect(formatDateToDisplay('2024-02-29')).toBe('29/02/2024')
    })

    it('should handle year boundary dates', () => {
        expect(dateToISO('31/12/2023')).toBe('2023-12-31')
        expect(dateToISO('01/01/2024')).toBe('2024-01-01')
    })

    it('should handle dates with spaces', () => {
        expect(maskDate('12 34 2024')).toBe('12/34/2024')
    })

    it('should handle clipboard paste with formatted date', () => {
        const { result } = renderHook(() => useDateMask())
        const mockSetFormData = jest.fn()

        // User pastes "15/03/2024"
        act(() => {
            result.current.handleDateChange('15/03/2024', 'dataInicio', mockSetFormData)
        })

        const callback = mockSetFormData.mock.calls[0][0]
        const newState = callback({ dataInicio: '' })

        expect(newState.dataInicio).toBe('2024-03-15')
    })
})
