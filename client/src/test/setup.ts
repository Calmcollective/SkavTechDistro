import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';
import React from 'react';

expect.extend(matchers);

// Make React available globally for tests
global.React = React;