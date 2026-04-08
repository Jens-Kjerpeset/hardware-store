{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\froman\fcharset0 Times-Bold;\f1\froman\fcharset0 Times-Roman;\f2\fmodern\fcharset0 Courier-Bold;
\f3\fmodern\fcharset0 Courier;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
{\*\listtable{\list\listtemplateid1\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid1\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid1}
{\list\listtemplateid2\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid101\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid2}
{\list\listtemplateid3\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid201\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid3}
{\list\listtemplateid4\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid301\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid4}}
{\*\listoverridetable{\listoverride\listid1\listoverridecount0\ls1}{\listoverride\listid2\listoverridecount0\ls2}{\listoverride\listid3\listoverridecount0\ls3}{\listoverride\listid4\listoverridecount0\ls4}}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\sa321\partightenfactor0

\f0\b\fs48 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 GLOBAL ANTIGRAVITY DIRECTIVES\
\pard\pardeftab720\sa298\partightenfactor0

\fs36 \cf0 1. THE NORTH STAR (CORE MISSION)\
\pard\pardeftab720\sa240\partightenfactor0

\f1\b0\fs24 \cf0 The highest priority for all generated code is human readability, navigability, and maintainability. Output must resemble the work of a pragmatic, senior human engineer. Code must be clean, logically separated, and trivial for a human to decipher and modify.\
\pard\pardeftab720\sa298\partightenfactor0

\f0\b\fs36 \cf0 2. THE "NEVER" LIST (STRICT BANS)\
\pard\pardeftab720\sa240\partightenfactor0

\f1\b0\fs24 \cf0 Do not execute the following patterns UNLESS the user prompt explicitly includes the exact phrase "AUTHORIZATION OVERRULE".\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls1\ilvl0
\f0\b \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No 
\f2\fs26 dangerouslySetInnerHTML
\f0\fs24 :
\f1\b0  Never use 
\f3\fs26 dangerouslySetInnerHTML
\f1\fs24  to render object data, API payloads, or user-derived strings. Use standard JSX interpolation to prevent XSS. Reserve this prop strictly for pre-sanitized rich text payloads.\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Inline Style Attributes:
\f1\b0  Never pass raw CSS strings into a 
\f3\fs26 style=\{\{\}\}
\f1\fs24  prop for static UI. All layout, flexbox grids, and typography must be handled by 
\f0\b Tailwind CSS v4
\f1\b0  utility classes. Only mutate the 
\f3\fs26 style
\f1\fs24  prop for highly dynamic, mathematically calculated inline values (e.g., pointer coordinates, dynamic progress bar percentages).\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No "God Objects":
\f1\b0  Never consolidate unrelated server data fetching, client state management, and dense UI rendering into a single, massive component. Enforce the Single Responsibility Principle.\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Cryptic Naming:
\f1\b0  Never use magic numbers, hardcoded configuration strings hidden deep in logic, or unsemantic abbreviations (e.g., use 
\f3\fs26 enclosure
\f1\fs24  not 
\f3\fs26 enc
\f1\fs24 ).\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Silent Failures:
\f1\b0  Never write empty 
\f3\fs26 catch
\f1\fs24  blocks. All errors must be handled, propagated, or logged explicitly with clear context.\
\pard\pardeftab720\sa298\partightenfactor0

\f0\b\fs36 \cf0 3. THE ARCHITECTURE PARADIGM (NEXT.JS 16 & REACT)\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls2\ilvl0
\fs24 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 RSC Default:
\f1\b0  All components must default to React Server Components (RSC) to minimize client-side JavaScript. The 
\f3\fs26 'use client'
\f1\fs24  directive must only be applied to the lowest possible leaf components in the rendering tree that strictly require interactive event listeners, React state hooks, or browser APIs.\
\ls2\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Server Actions for Mutations:
\f1\b0  All data mutations (e.g., form submissions, database updates) must be handled via typed Next.js Server Actions backed by strict 
\f0\b Zod
\f1\b0  schema validation. Do not build traditional 
\f3\fs26 /api
\f1\fs24  route handlers unless processing third-party webhooks.\
\ls2\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 State Management:
\f1\b0  Use the 
\f0\b Zustand
\f1\b0  store for complex, decoupled UI state logic. Strictly avoid deeply nested React Context providers or heavy prop-drilling for broad domain logic.\
\ls2\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Declarative Visual State:
\f1\b0  All visual state transitions (active, hidden, error, muted) must be handled via React's declarative state and conditional Tailwind template literals (e.g., 
\f3\fs26 className=\{
\f1\fs24 flex $\{isActive ? 'bg-green-500' : 'hidden'\}
\f3\fs26 \}
\f1\fs24 ). Never attempt manual DOM element queries.\
\pard\pardeftab720\sa298\partightenfactor0

\f0\b\fs36 \cf0 4. THE "PRAGMATIC" LIST (ONLY WHEN NECESSARY)\
\pard\pardeftab720\sa240\partightenfactor0

\f1\b0\fs24 \cf0 Execute these patterns only if the alternative creates excessive boilerplate, degrades performance, or is technically unfeasible.\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls3\ilvl0
\f0\b \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Immutability vs. Performance:
\f1\b0  Default to immutable state updates (e.g., spread operators). If manipulating massive data arrays where deep cloning causes severe UI stutter, localized mutations (or Immer via Zustand) are permitted. If mutating, leave a brief comment explaining the performance justification.\
\ls3\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Verbosity over Cleverness:
\f1\b0  If a complex one-liner (like a deeply nested ternary operator or a chained array method) saves lines but destroys human readability, write the longer, explicit 
\f3\fs26 if/else
\f1\fs24  block. Readability always wins.\
\pard\pardeftab720\sa298\partightenfactor0

\f0\b\fs36 \cf0 5. COMMENTARY & ARTIFACT SUPPRESSION\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls4\ilvl0
\fs24 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Prompt Echoing:
\f1\b0  Never reference these directives, the "North Star" guidelines, or user instructions within the codebase or file headers.\
\ls4\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Meta-Commentary:
\f1\b0  Do not write comments justifying standard syntax choices or performance optimizations (e.g., explaining why a Server Component or Tailwind class was used). Assume the codebase will be read by competent software engineers.\
\ls4\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 No Source Artifacts:
\f1\b0  Never reference screenshots, mockups, or uploaded files in the code (e.g., do not write 
\f3\fs26 /* Matches screenshot styling */
\f1\fs24 ).\
\ls4\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Purpose-Driven Documentation:
\f1\b0  Limit comments strictly to explaining complex business logic, edge cases, or non-obvious algorithmic decisions. Let the code self-document through precise naming.\
}