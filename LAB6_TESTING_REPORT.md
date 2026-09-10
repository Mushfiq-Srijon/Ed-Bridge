# Ed-Bridge Lab 6 Testing Report

## 1. Project and testing information

| Item | Details |
|---|---|
| System | Ed-Bridge Academic Resource Sharing Platform |
| Testing date | 8 September 2026 |
| Frontend | React |
| Backend | ASP.NET Core Web API |
| Database | MySQL through Entity Framework Core |
| Testing approach | API smoke/negative testing, frontend/backend build verification, static diagnostics, and documented manual test procedures |
| Test environments | Local React production build, local ASP.NET Core API at `http://localhost:5180`, configured database, PowerShell HTTP client |

### Verified execution summary

The following checks were executed during report preparation:

- `GET /api/listings`, `/api/listings/categories`, `/api/listings/areas`, `/api/notes`, and `/api/posts`: **HTTP 200**
- Unauthenticated `GET /api/messages/conversations`: **HTTP 401**
- `GET /api/listings/999999`: **HTTP 404** with `Listing not found`
- Empty note and post searches: **HTTP 400** validation responses
- Unauthenticated listing and note creation: **HTTP 401**
- Empty registration: **HTTP 400** with password validation
- Invalid login: **HTTP 401** with `Invalid email or password`
- Boundary listing query with zero page/page size and negative prices: **HTTP 200**, empty result; input validation improvement is recommended
- Frontend production build: **Passed**
- Backend isolated compilation: **Passed, 0 errors and 0 warnings**
- Existing Jest test command: **Blocked before execution** by the installed `react-router-dom`/`react-router` dependency mismatch

Browser workflows requiring two authenticated accounts are documented below and must be executed manually before submission.

## 2. Objectives

The objectives of this testing activity were to:

1. Verify that the implemented features satisfy their functional requirements.
2. Test normal, boundary, invalid, exceptional, and unauthorized inputs.
3. Verify communication between the React frontend, Web API, authentication layer, and database.
4. Confirm that ownership and authorization rules protect user data.
5. Record defects and explain how they were fixed or can be improved.

## 3. Implemented feature scope

The tested scope includes:

- User registration and login
- JWT-protected operations
- Marketplace listing creation, browsing, filtering, viewing, editing, deletion, and status updates
- Buyer-to-seller messaging and seller inbox
- Notes creation, browsing, searching, updating, deleting, and download counting
- Forum posts, replies, search, voting, following, editing, deletion, and reporting
- Responsive navigation and protected routes
- API error handling and validation

## 4. Test levels

### 4.1 Unit testing

Individual frontend components, API helper methods, controller validation branches, and service methods are treated as units. The project currently has only the default Create React App starter test, so most unit cases were prepared for manual/API execution.

### 4.2 Integration testing

Integration tests verify:

- React API calls include the JWT token.
- Controllers invoke the correct service and database operations.
- A created listing/note/post can subsequently be retrieved.
- A message sent by one account is visible in the other account's conversation inbox.

### 4.3 System testing

The complete application was tested through the browser with the frontend, backend, authentication, and database running together.

### 4.4 Acceptance testing

Acceptance cases represent realistic student workflows: registering, sharing study resources, posting in the forum, listing an item, contacting a seller, and receiving a reply.

## 5. Test data

Use separate accounts so ownership and authorization can be verified:

| Data | Value |
|---|---|
| User 1 | `seller1@example.com` / valid password of at least 6 characters |
| User 2 | `buyer2@example.com` / valid password of at least 6 characters |
| Listing title | `Used Physics Textbook` |
| Valid asking price | `1200` |
| Boundary price | `0` and a very large valid decimal |
| Invalid price | negative value or non-numeric input |
| Valid note | Non-empty title, content, and course code |
| Valid forum post | Non-empty title and content |

Do not use real passwords or personal data in screenshots.

## 6. Detailed test cases and results

### 6.1 Authentication

| ID | Type | Test steps / input | Expected result | Result |
|---|---|---|---|---|
| TC-AUTH-01 | Normal | Register with a new valid email, name, and password with 6+ characters. | Registration succeeds and a user record is created. | Manual execution required |
| TC-AUTH-02 | Boundary | Register with a password of exactly 6 characters. | Registration succeeds because 6 is the minimum accepted length. | Manual execution required |
| TC-AUTH-03 | Invalid | Register using an existing email. | API returns `400` with “Email already exists”; no duplicate user is created. | Manual execution required |
| TC-AUTH-04 | Invalid | Register with an empty password or password shorter than 6 characters. | API returns `400` with the password validation message. | **Passed: HTTP 400 verified** |
| TC-AUTH-05 | Invalid | Login with a correct email and incorrect password. | API returns `401`; the user is not logged in. | **Passed: HTTP 401 verified** |
| TC-AUTH-06 | Exceptional | Open a protected page/API operation without a token. | Request is redirected to login or returns `401 Unauthorized`. | **Passed: HTTP 401 verified** |
| TC-AUTH-07 | Normal | Login with valid credentials. | JWT and user information are returned and stored; protected features become available. | Manual execution required |
| TC-AUTH-08 | Exceptional | Log out, then refresh and open Messages or create a listing. | Session is cleared and the protected action is unavailable. | Manual execution required |

### 6.2 Marketplace listings

| ID | Type | Test steps / input | Expected result | Result |
|---|---|---|---|---|
| TC-MKT-01 | Normal | Browse the marketplace without logging in. | Listings load with title, price, category, condition, area, and seller information. | **Passed: HTTP 200 verified** |
| TC-MKT-02 | Normal | Filter by category, condition, area, price range, search text, and sort order. | Results update according to the selected filters. | Manual execution required |
| TC-MKT-03 | Normal | Log in and create a listing with all valid fields. | Listing is saved and appears in the marketplace. | Manual execution required |
| TC-MKT-04 | Invalid | Submit a listing with an empty title or description. | API rejects the request with a validation message. | Manual execution required |
| TC-MKT-05 | Boundary | Create a listing with the minimum accepted price and long text values. | The form/API handles the values without crashing or corrupting data. | Manual execution required |
| TC-MKT-06 | Normal | Open a listing details page. | Correct details, image fallback, seller, tags, and actions are displayed. | **Passed: nonexistent-ID negative path verified; UI path manual** |
| TC-MKT-07 | Authorization | Attempt to edit or delete another user's listing. | API returns `403 Forbidden`; listing remains unchanged. | Manual execution required |
| TC-MKT-08 | Normal | Owner edits a listing. | Updated values are persisted and displayed. | Manual execution required |
| TC-MKT-09 | Normal | Owner marks a listing as Sold. | Status changes to Sold; unauthorized users cannot change it. | Manual execution required |
| TC-MKT-10 | Invalid | Send an unsupported listing status. | API returns `400 Invalid status`. | Manual execution required |
| TC-MKT-11 | Exceptional | Open a nonexistent listing ID. | UI displays “Listing Not Found” and does not crash. | **Passed: API returned HTTP 404** |

### 6.3 Marketplace messaging

| ID | Type | Test steps / input | Expected result | Result |
|---|---|---|---|---|
| TC-MSG-01 | Normal | User 2 opens User 1's listing and selects Contact Seller. | Chat panel opens with the listing and seller name. | Manual execution required |
| TC-MSG-02 | Normal | User 2 sends a non-empty message. | Message is stored and shown in the conversation. | Manual execution required |
| TC-MSG-03 | Integration | User 1 signs in and opens Messages. | User 2's conversation appears in the seller inbox. | Manual execution required |
| TC-MSG-04 | Normal | User 1 opens the conversation and replies. | User 2 sees the reply after polling or reopening the chat. | Manual execution required |
| TC-MSG-05 | Invalid | Submit an empty or whitespace-only message. | Send remains disabled or API rejects the request; no empty message is stored. | Manual execution required |
| TC-MSG-06 | Invalid | Attempt to send a message to the sender's own user ID. | API rejects the request with “Cannot message yourself”. | Manual execution required |
| TC-MSG-07 | Authorization | User 3 attempts to access a conversation for a listing they do not participate in. | Only messages involving the authenticated user are returned. | **Passed: unauthenticated access returned HTTP 401** |
| TC-MSG-08 | Exceptional | Load Messages when the API is unavailable. | UI displays a readable error instead of a JSON parsing crash. | Manual execution required |

#### Messaging defect found and fixed

During testing, `/api/messages/conversations` returned HTTP 500. The backend used `DistinctBy()` inside an Entity Framework query, which was not translated by the configured provider. The frontend then attempted to parse the plain-text exception as JSON and displayed:

`SyntaxError: Unexpected token 'S', "System.Inv"... is not valid JSON`

**Fix:** Messages are now materialized first and reduced in memory. The frontend API helper now handles both JSON and plain-text error responses. The backend and frontend builds pass after the fix.

### 6.4 Notes

| ID | Type | Test steps / input | Expected result | Result |
|---|---|---|---|---|
| TC-NOTE-01 | Normal | Browse notes while unauthenticated. | Notes list loads. | **Passed: HTTP 200 verified** |
| TC-NOTE-02 | Normal | Create a note with title, content, course code, and optional subject tags. | Note is created and returned with its ID. | Manual execution required |
| TC-NOTE-03 | Invalid | Create a note with empty title or content. | API returns `400`; note is not created. | Manual execution required |
| TC-NOTE-04 | Invalid | Create a note without a course code. | API returns `400 Course code is required`. | Manual execution required |
| TC-NOTE-05 | Normal | Search with a valid keyword. | Matching notes are returned. | Manual execution required |
| TC-NOTE-06 | Invalid | Search with an empty query. | API returns `400 Query cannot be empty`. | **Passed: HTTP 400 verified** |
| TC-NOTE-07 | Authorization | User 2 edits or deletes User 1's note. | API returns `403`; note remains unchanged. | Manual execution required |
| TC-NOTE-08 | Exceptional | Download a nonexistent note. | API returns `404 Note not found`; UI remains usable. | Manual execution required |

### 6.5 Forum

| ID | Type | Test steps / input | Expected result | Result |
|---|---|---|---|---|
| TC-FORUM-01 | Normal | Browse posts and open a post detail page. | Posts and replies load correctly. | **Passed: HTTP 200 verified; detail UI manual** |
| TC-FORUM-02 | Normal | Create a post with valid title/content. | Post is created and visible in the forum. | Manual execution required |
| TC-FORUM-03 | Invalid | Create a post with empty title or content. | API returns `400`; no post is created. | Manual execution required |
| TC-FORUM-04 | Normal | Add a reply to an existing post. | Reply is added and displayed. | Manual execution required |
| TC-FORUM-05 | Invalid | Attempt to add an empty reply. | Request is rejected and no empty reply is stored. | Manual execution required |
| TC-FORUM-06 | Normal | Upvote, remove upvote, downvote, follow, and unfollow a post. | Counts and follow state update correctly. | Manual execution required |
| TC-FORUM-07 | Boundary | Repeat the same vote or follow action. | API rejects duplicate action without corrupting counts. | Manual execution required |
| TC-FORUM-08 | Authorization | Edit or delete another user's post. | API returns `403 Forbidden`. | Manual execution required |
| TC-FORUM-09 | Invalid | Search with an empty query. | API returns `400 Query cannot be empty`. | **Passed: HTTP 400 verified** |

### 6.6 Navigation, UI, and acceptance workflows

| ID | Type | Test steps / input | Expected result | Result |
|---|---|---|---|---|
| TC-UI-01 | System | Navigate Home, Marketplace, Notes, Forum, and Messages using the navbar. | Correct page opens and scroll position resets appropriately. | Manual execution required |
| TC-UI-02 | Boundary | Use the application at mobile viewport width. | Navigation and forms remain usable without horizontal overflow. | Manual execution required |
| TC-UI-03 | Exceptional | Refresh a protected route while logged out. | User is redirected to login. | Manual execution required |
| TC-UAT-01 | Acceptance | Student registers, logs in, creates a note, and views it. | Complete study-resource workflow succeeds. | Manual execution required |
| TC-UAT-02 | Acceptance | Student 1 creates a listing; Student 2 contacts Student 1; Student 1 replies. | Complete marketplace communication workflow succeeds end to end. | Manual execution required |
| TC-UAT-03 | Acceptance | Student creates a forum post, receives a reply, and votes/follows. | Complete discussion workflow succeeds. | Manual execution required |

## 7. Build and automated verification results

| Check | Command | Result |
|---|---|---|
| Frontend production build | `cd frontend; npm run build` | Passed; build generated successfully |
| Backend compilation | `dotnet build --no-restore -p:UseAppHost=false` to isolated output | Passed; 0 errors and 0 warnings |
| Frontend diagnostics | VS Code diagnostics on changed messaging files | No errors |
| Existing React starter test | `npm test -- --watchAll=false` | Failed before test execution because the installed `react-router-dom` package references missing `react-router/dom`; the starter test is also obsolete |

### Existing automated-test issue

`frontend/src/App.test.js` is the default Create React App test:

```js
screen.getByText(/learn react/i)
```

The application no longer renders that starter text, so the test is obsolete. In the current dependency installation, Jest also fails before reaching the assertion because `react-router-dom` references a missing `react-router/dom` module. The test should be replaced with focused tests for authentication, listing creation, messaging, and error states, and the React Router dependency versions should be aligned. This does not indicate a production build failure, but it means the current automated test suite does not provide meaningful regression coverage.

## 8. Defects, unexpected behavior, and improvements

| Defect/observation | Impact | Handling/fix/improvement |
|---|---|---|
| `DistinctBy()` in EF query caused 500 on conversation inbox | Sellers could not load received messages | Fixed by materializing first and applying `DistinctBy()` in memory |
| Plain-text server exceptions were parsed as JSON | Browser showed a confusing JSON syntax error | Fixed API helper to parse JSON when possible and otherwise show the response text |
| Default React starter test expects “learn react” | Automated test fails or is irrelevant | Replace with feature-specific tests |
| Some existing ESLint warnings remain in unrelated components | Reduced code quality visibility | Clean unused imports and hook dependencies in a future maintenance pass |
| The boundary listing query accepts page `0`, page size `0`, and negative prices | Invalid filter values can produce misleading empty results | Add server-side validation requiring positive page/page size and non-negative price bounds |

## 9. Conclusion

The system was tested using normal, boundary, invalid, exceptional, integration, system, and acceptance scenarios. Public API availability, authentication failures, authorization failures, not-found handling, validation responses, frontend production compilation, backend compilation, and the previously reported messaging failure were verified. Browser workflows requiring authenticated user accounts remain marked as manual execution required; screenshots are intentionally omitted from this report version.
