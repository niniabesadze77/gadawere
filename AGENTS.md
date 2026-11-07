<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Phone account identity is verified server-side and persisted in encrypted HttpOnly cookies; admin visibility and actions query the protected admins table, never browser-stored identity.
- Keep phone normalization in a shared browser-safe helper so Georgian country-prefix input maps to the same account.
