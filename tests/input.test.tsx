import { render, fireEvent } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom'
import Input from '../src';
import { getInputSelection } from '../src/input';
import { defer } from '../src/defer';

async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function setSelection(input: HTMLInputElement, start: number, length: number) {
    input.setSelectionRange(start, start + length);
    await defer(() => null);
}

async function setCursorPosition(input: HTMLInputElement, start: number) {
    await setSelection(input, start, 0);
}

function focus(input: HTMLInputElement) {
    input.focus();
    fireEvent.focus(input);
}

function blur(input: HTMLInputElement) {
    input.blur();
    fireEvent.blur(input);
}


describe('base', () => {
    let user: UserEvent;
    
    beforeEach(() => {
        user = userEvent.setup();
    })
    
    it('should format value on mount', async () => {
        const { container } = render(<Input mask='+7 (999) 999 99 99' defaultValue='74953156454'/>);
        const input = container.querySelector('input')!;
        expect(input).toHaveValue('+7 (495) 315 64 54');
    })
    
    it('should format value with invalid characters on mount', async () => {
        const { container } = render(<Input mask='+7 (9a9) 999 99 99' defaultValue='749531b6454'/>);
        const input = container.querySelector('input')!;
        expect(input).toHaveValue('+7 (4b6) 454 __ __');
    });
    
    it('should handle array mask', async () => {
        const letter = /[АВЕКМНОРСТУХ]/i;
        const digit = /[0-9]/;
        const mask = [ letter, digit, digit, digit, letter, letter ];
        
        const { container } = render(<Input mask={ mask } defaultValue='А 784 КТ 77'/>);
        const input = container.querySelector('input')!;
        
        expect(input).toHaveValue('А784КТ');
        
        focus(input);
        
        await user.keyboard('{Backspace}');
        expect(input).toHaveValue('А784К_');

        expect(getInputSelection(input).start).toEqual(5);
        expect(getInputSelection(input).end).toEqual(5);
  
        await user.keyboard('Х');
        expect(input).toHaveValue('А784КХ');
        expect(getInputSelection(input).start).toEqual(6);
        expect(getInputSelection(input).end).toEqual(6);
    });
    
    it('should handle full length maskPlaceholder', async () => {
        const { container } = render(<Input mask='99/99/9999' maskPlaceholder='dd/mm/yyyy' defaultValue='12'/>);
        const input = container.querySelector('input')!;

        expect(input).toHaveValue('12/mm/yyyy');
        
        focus(input);
        
        expect(getInputSelection(input).start).toEqual(3);
        expect(getInputSelection(input).end).toEqual(3);
        
        await user.keyboard('{Backspace}');
        expect(input).toHaveValue('1d/mm/yyyy');
        
        await user.keyboard('234');
     
        expect(input).toHaveValue('12/34/yyyy');
        expect(getInputSelection(input).start).toEqual(6);
        expect(getInputSelection(input).end).toEqual(6);
        
        await setCursorPosition(input, 8);
        await user.keyboard('7');
        expect(input).toHaveValue('12/34/yy7y');
    });
    
    it("should show placeholder on focus", async () => {
        const { container } = render(<Input mask="+7 (*a9) 999 99 99"/>);
        const input = container.querySelector('input')!;

        expect(input).toHaveValue("");
        
        focus(input);
        
        expect(input).toHaveValue("+7 (___) ___ __ __");
    });
    
    it("should clear input on blur", async () => {
        const { container } = render(<Input mask="+7 (*a9) 999 99 99"/>);
        const input = container.querySelector('input')!;
        
        focus(input);
        
        expect(input).toHaveValue("+7 (___) ___ __ __");
        
        await user.keyboard('{Tab}');
        expect(input).toHaveValue("");
        
        focus(input);
        await user.keyboard('1');
        expect(input).toHaveValue("+7 (1__) ___ __ __");
        
        await user.keyboard('{Tab}');
        expect(input).toHaveValue("+7 (1__) ___ __ __");
    });
    
    it("should handle escaped characters in mask", async () => {
        const { container } = render(<Input mask="+4\9 99 9\99 99" maskPlaceholder={null}/>);
        const input = container.querySelector('input')!;
        
        focus(input);
        
        await user.keyboard('129');
        
        expect(input).toHaveValue("+49 12 99");
        
        await user.keyboard('{ArrowLeft}{ArrowLeft}');
        await sleep(50);
        await user.keyboard('1');
        
        expect(input).toHaveValue("+49 12 199 ");
        expect(getInputSelection(input).start).toEqual(9);
        expect(getInputSelection(input).end).toEqual(9);
        
        await user.keyboard('{ArrowLeft}');
        await sleep(50);
        await user.keyboard('9');
        expect(input).toHaveValue("+49 12 199 ");
        expect(getInputSelection(input).start).toEqual(9);
        expect(getInputSelection(input).end).toEqual(9);
    });
    
    it("should handle alwaysShowMask", async () => {
        const { container, rerender } = render(<Input mask="+7 (999) 999 99 99" alwaysShowMask/>);
        const input = container.querySelector('input')!;
        
        expect(input).toHaveValue("+7 (___) ___ __ __");
        
        focus(input);
        
        expect(input).toHaveValue("+7 (___) ___ __ __");
        
        blur(input);
        expect(input).toHaveValue("+7 (___) ___ __ __");
        
        rerender(<Input mask="+7 (999) 999 99 99" alwaysShowMask={false}/>)
        expect(input).toHaveValue("");
        
        rerender(<Input mask="+7 (999) 999 99 99" alwaysShowMask={true}/>)
        expect(input).toHaveValue("+7 (___) ___ __ __");
    });
    
    it("should adjust cursor position on focus", async () => {
        const { container, rerender } = render(<Input mask="+7 (999) 999 99 99" value="+7"/>);
        const input = container.querySelector('input')!;
        
        focus(input);
        
        expect(getInputSelection(input).start).toEqual(4);
        expect(getInputSelection(input).end).toEqual(4);
        
        blur(input);
        
        rerender(<Input mask="+7 (999) 999 99 99" value="+7 (___) ___ _1 __"/>);
        
        focus(input);
        await setCursorPosition(input, 2);
        await sleep(50);
        
        expect(getInputSelection(input).start).toEqual(16);
        expect(getInputSelection(input).end).toEqual(16);

        blur(input);
        
        rerender(<Input mask="+7 (999) 999 99 99" value="+7 (___) ___ _1 _1"/>);
        focus(input);
        await sleep(150);
        expect(getInputSelection(input).start).toEqual(18);
        expect(getInputSelection(input).end).toEqual(18);
        
        blur(input);
        
        rerender(<Input mask="+7 (999)" value="+7 (123)" maskPlaceholder={null}/>);
        
        await setCursorPosition(input, 2);
        focus(input);
        expect(getInputSelection(input).start).toEqual(2);
        expect(getInputSelection(input).end).toEqual(2);
    });
    
    it("should adjust cursor position on focus on input with autoFocus", async () => {
        const { container, rerender } = render(<Input mask="+7 (999) 999 99 99" value="+7" autoFocus />);
        const input = container.querySelector('input')!;
        
        expect(getInputSelection(input).start).toEqual(4);
        expect(getInputSelection(input).end).toEqual(4);
        
        blur(input);
        
        rerender(<Input mask="+7 (999) 999 99 99" value="+7 (___) ___ _1 __" autoFocus/>);
        focus(input);
        await setCursorPosition(input, 2);
        await sleep(50);
        
        expect(getInputSelection(input).start).toEqual(16);
        expect(getInputSelection(input).end).toEqual(16);
        
        blur(input);
        
        rerender(<Input mask="+7 (999) 999 99 99" value="+7 (___) ___ _1 _1" autoFocus/>);
        await setCursorPosition(input, 2);
        focus(input);
        expect(getInputSelection(input).start).toEqual(2);
        expect(getInputSelection(input).end).toEqual(2);
    });
    
    it("should handle changes on input with autoFocus", async () => {
        const { container } = render(<Input mask="+7 (999) 999 99 99" autoFocus />);
        const input = container.querySelector('input')!;
        await user.keyboard("222 222 22 22");
        
        await setSelection(input, 5, 0);
        await sleep(50);
        await user.keyboard("3");
        
        expect(input).toHaveValue("+7 (232) 222 22 22");
    });
})