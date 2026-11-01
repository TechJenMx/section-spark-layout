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

- Consultation AI uses a same-origin, consent-validated streaming server route with server-only Gateway helpers; no diary content is persisted or made public.
- AI service blocks are stored in a service-role-only table so provider denials remain paused across restarts; resumption requires restored access and a fresh owner action.
