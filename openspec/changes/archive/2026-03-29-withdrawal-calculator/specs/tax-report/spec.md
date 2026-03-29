# Capability: Tax Report

## MODIFIED Requirements

### Requirement: Calculate Realized Gains using FIFO with Holding Periods

The system SHALL support simulation of realized gains by allowing mock sale transactions to be processed through the standard FIFO engine.

#### Scenario: Simulated sale for withdrawal calculation

- **Given** a set of existing purchase transactions.
- **When** a "mock" sale transaction for today is provided with a specific unit count and NAV.
- **Then** the system should return the calculated LTCG, STCG, or Debt gains for those units as if the sale had occurred today.

## ADDED Requirements

### Requirement: Potential Withdrawal (What-if) Analysis

The system SHALL provide a "What-if" calculator to help users estimate the tax impact of a potential redemption.

#### Scenario: User inputs units to withdraw

- **Given** the user has 1000 units of a scheme.
- **When** the user enters 500 units into the Withdrawal Calculator.
- **Then** the system SHALL display the estimated gain breakdown (LTCG/STCG/Debt) for those 500 units based on the current NAV.

#### Scenario: User inputs amount to withdraw

- **Given** the user has units worth ₹1,00,000 at current NAV.
- **When** the user enters ₹50,000 as the target withdrawal amount.
- **Then** the system SHALL automatically calculate the required units and display the estimated tax impact.

#### Scenario: Prevent over-withdrawal

- **Given** the user has 100 units of a scheme.
- **When** the user attempts to enter 150 units for simulation.
- **Then** the system SHALL display a validation error or cap the input to the current balance.
