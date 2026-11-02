/** Predictable, non-sensitive messages for common auth failures. */
export function authFeedback(error: unknown): string {
  const text = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (/invalid login|invalid credentials|invalid email or password/i.test(text)) {
    return "Սխալ էլ. փոստ կամ գաղտնաբառ։ Ստուգիր տվյալները կամ վերականգնիր գաղտնաբառը։";
  }
  if (/email not confirmed|email.*not.*verified/i.test(text)) {
    return "Հաստատիր էլ. փոստդ՝ մուտքն ավարտելու համար։";
  }
  if (/rate limit|too many|over_email_send_rate_limit|429/i.test(text)) {
    return "Չափազանց շատ փորձեր են կատարվել։ Փորձիր մի փոքր ուշ։";
  }
  if (/redirect_uri|redirect url|redirect_uri_mismatch|oauth.+not.+enabled|provider.+not.+enabled/i.test(text)) {
    return "Google մուտքը կարգավորված չէ։ Ստուգիր Lovable-ի Google provider-ը և թույլատրված վերադարձի հասցեները։";
  }
  if (/Failed to fetch|NetworkError|network request|fetch failed|timeout|aborted/i.test(text)) {
    return "Չհաջողվեց կապ հաստատել մուտքի ծառայության հետ։ Ստուգիր կապը և փորձիր կրկին։";
  }
  if (/missing supabase|environment variable|configuration/i.test(text)) {
    return "Մուտքի ծառայության կարգավորումները բացակայում են։ Ուսուցումը հասանելի է առանց հաշվի։";
  }
  return "Մուտքը չհաջողվեց։ Փորձիր կրկին, իսկ կրկնվող սխալի դեպքում գրիր աջակցությանը։";
}
