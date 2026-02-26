package com.fintrack.backend.repository;

import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.Transaction.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    boolean existsByUserIdAndRawEmailId(UUID userId, String rawEmailId);

    Page<Transaction> findByUserIdOrderByTransactionDateDesc(UUID userId, Pageable pageable);

    @Query("""
            SELECT t FROM Transaction t WHERE t.user.id = :userId
            AND (:startDate IS NULL OR t.transactionDate >= :startDate)
            AND (:endDate IS NULL OR t.transactionDate <= :endDate)
            AND (:category IS NULL OR t.category = :category)
            AND (:type IS NULL OR t.type = :type)
            AND (:search IS NULL OR LOWER(t.merchant) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY t.transactionDate DESC
            """)
    Page<Transaction> findByUserIdWithFilters(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("category") String category,
            @Param("type") TransactionType type,
            @Param("search") String search,
            Pageable pageable);

    @Query("""
            SELECT t.category, SUM(t.amount) as total, COUNT(t) as count
            FROM Transaction t
            WHERE t.user.id = :userId
            AND t.type = 'DEBIT'
            AND t.transactionDate >= :startDate
            AND t.transactionDate <= :endDate
            GROUP BY t.category
            ORDER BY total DESC
            """)
    List<Object[]> findCategoryBreakdown(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT YEAR(t.transactionDate), MONTH(t.transactionDate),
                   SUM(CASE WHEN t.type = 'DEBIT' THEN t.amount ELSE 0 END),
                   SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount ELSE 0 END)
            FROM Transaction t
            WHERE t.user.id = :userId
            AND t.transactionDate >= :startDate
            GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate)
            ORDER BY YEAR(t.transactionDate), MONTH(t.transactionDate)
            """)
    List<Object[]> findMonthlyTotals(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate);

    @Query("""
            SELECT t.merchant, SUM(t.amount) as total
            FROM Transaction t
            WHERE t.user.id = :userId
            AND t.type = 'DEBIT'
            AND t.transactionDate >= :startDate
            AND t.transactionDate <= :endDate
            AND t.merchant IS NOT NULL
            GROUP BY t.merchant
            ORDER BY total DESC
            """)
    List<Object[]> findTopMerchants(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("""
            SELECT SUM(t.amount) FROM Transaction t
            WHERE t.user.id = :userId AND t.type = :type
            AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate
            """)
    Optional<BigDecimal> sumByUserIdAndTypeAndDateRange(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    long countByUserIdAndTransactionDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);

    @Query("""
            SELECT t FROM Transaction t WHERE t.user.id = :userId
            ORDER BY t.transactionDate DESC
            """)
    List<Transaction> findRecentByUserId(@Param("userId") UUID userId, Pageable pageable);
}
