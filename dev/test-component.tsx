import React, { ReactNode } from 'react';
import InputMask from '../src';
import './styles.css';

export function TestComponent(): ReactNode {
    const letter = /[АВЕКМНОРСТУХ]/i;
    const digit = /[0-9]/;
    const mask = [ letter, digit, digit, digit, letter, letter ];

    return (
        <div className='container'>
            <InputMask mask={'+7 (999) 999-99-99'}/>
            <InputMask mask={ mask } defaultValue='А 784 КТ 77'/>
            <InputMask mask='99/99/9999' maskPlaceholder='dd/mm/yyyy' defaultValue='12'/>
            <InputMask mask="+4\9 99 9\99 99" maskPlaceholder={null}/>
            <InputMask mask="+7 (999) 999 99 99" defaultValue="+7 (___) ___ _1 _1"/>
        </div>
    )
}