import '@testing-library/jest-dom'
import {render, screen, fireEvent} from '@testing-library/svelte';
import Breadcrumb from '../lib/breadcrumb/Breadcrumb.svelte';
import { buildBreadcrumbs } from '../lib/helpers/html';

describe('test breadcrums builder', () => {
    it('should build a breadcrum with one element given this path /trading', () => {
        const path = '/trading';
        const readableNames = {
          'trading': 'Trading Data'
        }
        const result = buildBreadcrumbs(path, readableNames);
        expect(result.length).toBe(1);
        expect(result[0].name).toEqual('Trading Data');
    });
});

// describe('Breadcrumb component', () => {
//   it('given a url with a single path should render a breadcrum with one element', () => {
//     const breadcrums =  [
//         { url: '/trading', name: 'trading', linkActive: true,  head: true }
//     ]
//     render(Breadcrumb, { breadcrums });
//   });
// });
