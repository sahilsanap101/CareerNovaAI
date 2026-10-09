# Assessment Component Diagnosis

**A. Does the observable assessment data contain predictive information?**
Yes. Learned baselines (RF Assessment-Only) significantly outperform random chance and the deterministic PATHFORGE Assessment-Only baseline, confirming the 20 Likert features contain a recoverable causal signal linking them to suitable careers.

**B. Does assessment add information beyond profile?**
Yes. When training a Random Forest on Profile+Assessment features vs Profile-only features, there are noticeable gains, particularly in Conditions B and C where the assessment data specifically holds complementary latent information.

**C. Does PATHFORGE Assessment v1 recover that information?**
No. The deterministic Likert-to-Career mapping in Assessment v1 (M1 model) fails drastically. In Condition C (assessment dominant), M1 achieved only a 5% Top-1 accuracy, while RF Assessment-only achieved >25%.

**D. Does the deterministic fusion mechanism benefit from that recovered signal?**
No. Because the underlying $Q(u,c)$ function fails to recover the signal, linearly mixing it into $P(u,c)$ acts essentially as adding noise. The fusion mechanism itself is helpless if the inputs to the scalar combination are faulty.
