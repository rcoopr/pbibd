# Continuations of exploring round-robin style draws for multi-entry heats

Demo: https://pbibd.vercel.app/

Using PBIBDs or Partially balanced incomplete block designs, we can generate a tournament draw (or many, and select the best one). PBIBDs handle uneven heat sizes and provide some ways to measure how 'fair' they are.

The simple overview is that we select pairing with a weighted random distribution based on the number of times each entrant has seen other entrants in the heat.

With this model we:

- Don't require the strict orthogonality conditions of MOLS
- Allows for incomplete blocks (uneven heats)
- Provide measurable bounds on fairness

---

The demo lets you select athlete count, heat size, round count and iteration count (in my testing, 1000 iterations happens in < 100ms) and there are visualisations to help assess the fairness and look at specific draws. Min/Max Facings are the numbers of times that a single entrant will face another entrant across all of the rounds. Variance here is measuring the variance of the facings counts for all athletes across all heats (lower is better in some way). I think the optimal choice is ordering by minimum Max Facings, then by variance (and possibly then by maximising Min Facings)

![demo image](/demo.png)
